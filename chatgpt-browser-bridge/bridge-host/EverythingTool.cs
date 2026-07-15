using System.Diagnostics;
using System.Text;
using System.Text.Json.Nodes;

static class EverythingTool
{
    public static async Task<JsonObject> SearchAsync(JsonObject req)
    {
        var executable = ToolResolver.Resolve("es.exe")
            ?? throw new FileNotFoundException(
                "es.exe не найден рядом с BridgeHost.exe и в PATH"
            );

        var query = req["query"]?.GetValue<string>()?.Trim() ?? "";
        var limit = Math.Clamp(req["limit"]?.GetValue<int>() ?? 100, 1, 5000);
        var timeoutSeconds = Math.Clamp(
            req["timeout_seconds"]?.GetValue<int>() ?? 30,
            1,
            300
        );

        if (string.IsNullOrWhiteSpace(query))
            throw new InvalidOperationException("Поисковый запрос не может быть пустым");

        string? workspaceRoot = null;
        var workspaceName = req["workspace"]?.GetValue<string>();

        if (!string.IsNullOrWhiteSpace(workspaceName))
        {
            workspaceRoot = WorkspaceStore.ResolveWorkspacePath(
                workspaceName,
                ""
            );
        }

        var startInfo = new ProcessStartInfo
        {
            FileName = executable,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8
        };

        startInfo.ArgumentList.Add("-n");
        startInfo.ArgumentList.Add(limit.ToString());

        string effectiveQuery;

        if (workspaceRoot is null)
        {
            effectiveQuery = query;
            startInfo.ArgumentList.Add(query);
        }
        else
        {
            effectiveQuery = $"{workspaceRoot} {query}";
            startInfo.ArgumentList.Add("-p");
            startInfo.ArgumentList.Add(workspaceRoot);
            startInfo.ArgumentList.Add(query);
        }

        using var process = new Process { StartInfo = startInfo };
        var stopwatch = Stopwatch.StartNew();

        process.Start();

        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();

        using var cancellation = new CancellationTokenSource(
            TimeSpan.FromSeconds(timeoutSeconds)
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
            }

            throw new TimeoutException("Превышен таймаут поиска Everything");
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;
        var matches = new JsonArray();
        var filteredOut = 0;

        foreach (var rawLine in stdout.Split(
                     new[] { "\r\n", "\n" },
                     StringSplitOptions.RemoveEmptyEntries
                 ))
        {
            var path = rawLine.Trim();
            if (string.IsNullOrWhiteSpace(path))
                continue;

            string fullPath;

            try
            {
                fullPath = Path.GetFullPath(path);
            }
            catch
            {
                continue;
            }

            if (workspaceRoot is not null &&
                !IsInsideWorkspace(workspaceRoot, fullPath))
            {
                filteredOut++;
                continue;
            }

            var isDirectory = Directory.Exists(fullPath);

            matches.Add(new JsonObject
            {
                ["name"] = Path.GetFileName(fullPath),
                ["path"] = fullPath,
                ["directory"] = isDirectory
                    ? fullPath
                    : Path.GetDirectoryName(fullPath),
                ["extension"] = isDirectory
                    ? ""
                    : Path.GetExtension(fullPath),
                ["type"] = isDirectory ? "directory" : "file",
                ["exists"] = isDirectory || File.Exists(fullPath)
            });
        }

        return Result.Ok(req, new JsonObject
        {
            ["executable"] = executable,
            ["query"] = query,
            ["effective_query"] = effectiveQuery,
            ["match_path"] = workspaceRoot is not null,
            ["workspace"] = workspaceName,
            ["workspace_root"] = workspaceRoot,
            ["exit_code"] = process.ExitCode,
            ["duration_ms"] = stopwatch.ElapsedMilliseconds,
            ["filtered_out"] = filteredOut,
            ["matches"] = matches,
            ["stderr"] = stderr,
            ["truncated"] = matches.Count >= limit
        });
    }

    private static bool IsInsideWorkspace(string root, string path)
    {
        var normalizedRoot = Path.GetFullPath(root)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        var normalizedPath = Path.GetFullPath(path);
        var prefix = normalizedRoot + Path.DirectorySeparatorChar;

        return normalizedPath.Equals(
                   normalizedRoot,
                   StringComparison.OrdinalIgnoreCase
               ) ||
               normalizedPath.StartsWith(
                   prefix,
                   StringComparison.OrdinalIgnoreCase
               );
    }
}
