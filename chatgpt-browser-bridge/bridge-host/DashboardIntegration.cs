using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

static class BridgeStateStore
{
    private static readonly object Sync = new();

    private static readonly string StatePath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "dashboard-state.json"
    );

    private static DateTimeOffset? _operationStartedAt;

    public static void MarkRunning(JsonObject request)
    {
        lock (Sync)
        {
            var state = LoadUnsafe();
            var now = DateTimeOffset.UtcNow;

            _operationStartedAt = now;
            state.TotalCommands++;
            state.Status = "running";
            state.Tool = request["tool"]?.GetValue<string>();
            state.RequestId = request["id"]?.GetValue<string>();
            state.Summary = null;
            state.Error = null;
            state.OperationStartedAt = now;
            state.UpdatedAt = now;
            state.HostProcessId = Environment.ProcessId;
            state.HostVersion = "0.18.5";

            SaveUnsafe(state);
        }
    }

    public static void MarkSuccess(JsonObject request, JsonObject response)
    {
        lock (Sync)
        {
            var state = LoadUnsafe();
            var now = DateTimeOffset.UtcNow;

            state.SuccessfulCommands++;
            state.Status = "success";
            state.Tool = request["tool"]?.GetValue<string>();
            state.RequestId = request["id"]?.GetValue<string>();
            state.Summary = BuildSummary(response);
            state.Error = null;
            state.LastDurationMilliseconds = CalculateDuration(now);
            state.OperationStartedAt = null;
            state.UpdatedAt = now;
            state.HostProcessId = Environment.ProcessId;
            state.HostVersion = "0.18.5";

            _operationStartedAt = null;
            SaveUnsafe(state);
        }
    }

    public static void MarkError(JsonObject request, string error)
    {
        lock (Sync)
        {
            var state = LoadUnsafe();
            var now = DateTimeOffset.UtcNow;

            state.FailedCommands++;
            state.Status = "error";
            state.Tool = request["tool"]?.GetValue<string>();
            state.RequestId = request["id"]?.GetValue<string>();
            state.Summary = null;
            state.Error = error;
            state.LastDurationMilliseconds = CalculateDuration(now);
            state.OperationStartedAt = null;
            state.UpdatedAt = now;
            state.HostProcessId = Environment.ProcessId;
            state.HostVersion = "0.18.5";

            _operationStartedAt = null;
            SaveUnsafe(state);
        }
    }

    public static DashboardState Snapshot()
    {
        lock (Sync)
            return LoadUnsafe();
    }

    public static string GetStatePath() => StatePath;

    private static long CalculateDuration(DateTimeOffset completedAt)
    {
        return _operationStartedAt.HasValue
            ? Math.Max(
                0,
                (long)(completedAt - _operationStartedAt.Value).TotalMilliseconds
            )
            : 0;
    }

    private static DashboardState LoadUnsafe()
    {
        if (!File.Exists(StatePath))
            return new DashboardState();

        try
        {
            var json = File.ReadAllText(StatePath, Encoding.UTF8);
            return JsonSerializer.Deserialize<DashboardState>(json)
                ?? new DashboardState();
        }
        catch
        {
            return new DashboardState();
        }
    }

    private static void SaveUnsafe(DashboardState state)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(StatePath)!);

        var temporaryPath = StatePath + ".tmp-" +
            Guid.NewGuid().ToString("N");

        var json = JsonSerializer.Serialize(
            state,
            new JsonSerializerOptions { WriteIndented = true }
        );

        File.WriteAllText(
            temporaryPath,
            json,
            new UTF8Encoding(false)
        );

        File.Move(temporaryPath, StatePath, true);
    }

    private static string BuildSummary(JsonObject response)
    {
        if (response["status"]?.GetValue<string>() == "error")
            return response["error"]?.GetValue<string>() ?? "Ошибка";

        if (response["data"] is not JsonObject data)
            return "Операция завершена";

        if (data["transaction_id"] is not null)
            return $"Транзакция завершена, файлов: {data["file_count"]?.GetValue<int>() ?? 0}";

        if (data["batch_id"] is not null)
            return $"Пакет применён, файлов: {data["file_count"]?.GetValue<int>() ?? 0}";

        if (data["read_count"] is not null)
        {
            var read = data["read_count"]?.GetValue<int>() ?? 0;
            var errors = data["error_count"]?.GetValue<int>() ?? 0;
            return $"Прочитано: {read}, ошибок: {errors}";
        }

        return "Операция завершена успешно";
    }
}

sealed class DashboardState
{
    public string HostVersion { get; set; } = "0.18.5";
    public int HostProcessId { get; set; }
    public string Status { get; set; } = "idle";
    public string? Tool { get; set; }
    public string? RequestId { get; set; }
    public string? Summary { get; set; }
    public string? Error { get; set; }
    public long TotalCommands { get; set; }
    public long SuccessfulCommands { get; set; }
    public long FailedCommands { get; set; }
    public long LastDurationMilliseconds { get; set; }
    public DateTimeOffset? OperationStartedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

static class DashboardHost
{
    private const string DashboardExecutableName = "BridgeDashboard.exe";

    public static JsonObject Open(JsonObject request)
    {
        var executable = ResolveExecutable();
        var existing = FindRunningProcess();
        var started = false;

        if (existing is null)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = executable,
                WorkingDirectory = Path.GetDirectoryName(executable)!,
                UseShellExecute = true
            };

            var startedProcess = Process.Start(startInfo);

            if (startedProcess is null)
            {
                throw new InvalidOperationException(
                    "Не удалось запустить BridgeDashboard.exe"
                );
            }

            started = true;
        }

        Thread.Sleep(250);
        var running = FindRunningProcess();

        return Result.Ok(request, new JsonObject
        {
            ["opened"] = running is not null,
            ["running"] = running is not null,
            ["started"] = started,
            ["process_id"] = running?.Id,
            ["executable"] = executable,
            ["state_path"] = BridgeStateStore.GetStatePath()
        });
    }

    public static JsonObject Status(JsonObject request)
    {
        var process = FindRunningProcess();
        var state = BridgeStateStore.Snapshot();

        return Result.Ok(request, new JsonObject
        {
            ["running"] = process is not null,
            ["process_id"] = process?.Id,
            ["executable"] = TryResolveExecutable(),
            ["state_path"] = BridgeStateStore.GetStatePath(),
            ["state"] = new JsonObject
            {
                ["host_version"] = state.HostVersion,
                ["host_process_id"] = state.HostProcessId,
                ["status"] = state.Status,
                ["tool"] = state.Tool,
                ["request_id"] = state.RequestId,
                ["summary"] = state.Summary,
                ["error"] = state.Error,
                ["total_commands"] = state.TotalCommands,
                ["successful_commands"] = state.SuccessfulCommands,
                ["failed_commands"] = state.FailedCommands,
                ["last_duration_ms"] = state.LastDurationMilliseconds,
                ["operation_started_at"] = state.OperationStartedAt?.ToString("O"),
                ["updated_at"] = state.UpdatedAt.ToString("O")
            }
        });
    }

    private static Process? FindRunningProcess()
    {
        try
        {
            return Process.GetProcessesByName("BridgeDashboard")
                .FirstOrDefault(process => !process.HasExited);
        }
        catch
        {
            return null;
        }
    }

    private static string ResolveExecutable()
    {
        return TryResolveExecutable()
            ?? throw new FileNotFoundException(
                "BridgeDashboard.exe не найден рядом с BridgeHost.exe",
                Path.Combine(AppContext.BaseDirectory, DashboardExecutableName)
            );
    }

    private static string? TryResolveExecutable()
    {
        var path = Path.Combine(
            AppContext.BaseDirectory,
            DashboardExecutableName
        );

        return File.Exists(path) ? path : null;
    }
}
