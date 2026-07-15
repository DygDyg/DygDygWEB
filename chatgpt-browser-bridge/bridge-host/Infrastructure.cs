using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Nodes;

static class ProcessRunner
{
    public static async Task<JsonObject> Run(
        JsonObject req,
        string exe,
        IReadOnlyList<string> args,
        string? cwd,
        int timeoutSeconds
    )
    {
        var psi = new ProcessStartInfo
        {
            FileName = exe,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        if (!string.IsNullOrWhiteSpace(cwd))
            psi.WorkingDirectory = Path.GetFullPath(cwd);

        foreach (var arg in args)
            psi.ArgumentList.Add(arg);

        using var process = new Process { StartInfo = psi };
        var stopwatch = Stopwatch.StartNew();

        process.Start();

        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();

        using var cancellation = new CancellationTokenSource(
            TimeSpan.FromSeconds(Math.Clamp(timeoutSeconds, 1, 3600))
        );

        try
        {
            await process.WaitForExitAsync(cancellation.Token);
        }
        catch (OperationCanceledException)
        {
            try
            {
                process.Kill(true);
            }
            catch
            {
                // Process may already be terminated.
            }

            throw new TimeoutException("Превышен таймаут процесса");
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;
        const int maxOutputChars = 200000;

        return Result.Ok(req, new JsonObject
        {
            ["executable"] = exe,
            ["exit_code"] = process.ExitCode,
            ["stdout"] = stdout.Length > maxOutputChars
                ? stdout[..maxOutputChars]
                : stdout,
            ["stderr"] = stderr.Length > maxOutputChars
                ? stderr[..maxOutputChars]
                : stderr,
            ["duration_ms"] = stopwatch.ElapsedMilliseconds,
            ["truncated"] = stdout.Length > maxOutputChars ||
                            stderr.Length > maxOutputChars
        });
    }
}

static class ToolResolver
{
    public static string? Resolve(string name)
    {
        if (Path.IsPathRooted(name) && File.Exists(name))
            return Path.GetFullPath(name);

        var local = Path.Combine(AppContext.BaseDirectory, name);
        if (File.Exists(local))
            return local;

        var pathValue = Environment.GetEnvironmentVariable("PATH") ?? "";

        foreach (var directory in pathValue.Split(
                     Path.PathSeparator,
                     StringSplitOptions.RemoveEmptyEntries
                 ))
        {
            try
            {
                var candidate = Path.Combine(directory.Trim(), name);
                if (File.Exists(candidate))
                    return candidate;
            }
            catch
            {
                // Ignore malformed PATH entries.
            }
        }

        return null;
    }
}

static class Paths
{
    public static string Full(JsonObject req, string key)
    {
        return WorkspaceStore.ResolvePath(req, key);
    }
}

static class Result
{
    public static JsonObject Ok(JsonObject req, JsonObject data)
    {
        return new JsonObject
        {
            ["version"] = 1,
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = req["tool"]?.DeepClone(),
            ["status"] = "ok",
            ["captured_at"] = DateTimeOffset.UtcNow.ToString("O"),
            ["data"] = data
        };
    }

    public static JsonObject Error(JsonObject req, string error)
    {
        return new JsonObject
        {
            ["version"] = 1,
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = req["tool"]?.DeepClone(),
            ["status"] = "error",
            ["captured_at"] = DateTimeOffset.UtcNow.ToString("O"),
            ["error"] = error
        };
    }
}

static class NativeMessaging
{
    private static readonly JsonSerializerOptions Options = new()
    {
        WriteIndented = false
    };

    public static async Task<JsonObject?> ReadAsync(Stream input)
    {
        var lengthBytes = new byte[4];
        var read = await input.ReadAsync(lengthBytes);

        if (read == 0)
            return null;

        while (read < 4)
        {
            var count = await input.ReadAsync(
                lengthBytes.AsMemory(read, 4 - read)
            );

            if (count == 0)
                throw new EndOfStreamException();

            read += count;
        }

        var length = BitConverter.ToInt32(lengthBytes, 0);

        if (length <= 0 || length > 16 * 1024 * 1024)
            throw new InvalidDataException("Недопустимый размер сообщения");

        var data = new byte[length];
        var position = 0;

        while (position < length)
        {
            var count = await input.ReadAsync(
                data.AsMemory(position, length - position)
            );

            if (count == 0)
                throw new EndOfStreamException();

            position += count;
        }

        return JsonNode.Parse(data)?.AsObject();
    }

    public static async Task WriteAsync(Stream output, JsonObject value)
    {
        var data = JsonSerializer.SerializeToUtf8Bytes(value, Options);
        var length = BitConverter.GetBytes(data.Length);

        await output.WriteAsync(length);
        await output.WriteAsync(data);
        await output.FlushAsync();
    }
}
