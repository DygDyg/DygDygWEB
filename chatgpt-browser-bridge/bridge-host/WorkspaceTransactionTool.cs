using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

static class WorkspaceTransactionTool
{
    private const int MaxFiles = 100;
    private const int MaxProcessOutputChars = 200000;

    public static async Task<JsonObject> ApplyAsync(JsonObject req)
    {
        var files = req["files"] as JsonArray
            ?? throw new InvalidOperationException("Не указано поле files");

        if (files.Count == 0)
            throw new InvalidOperationException("Список files пуст");

        if (files.Count > MaxFiles)
            throw new InvalidOperationException(
                $"За одну транзакцию разрешено не более {MaxFiles} файлов"
            );

        var prepared = PrepareFiles(req, files);
        var verify = ParseVerify(req);

        BatchPatchPreviewDialog.Confirm(prepared);

        var transactionId = Guid.NewGuid().ToString("N");
        var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        var applied = new List<AppliedFile>();

        try
        {
            foreach (var item in prepared)
            {
                var backupPath = item.Path +
                    $".cbb-transaction-{transactionId}-{timestamp}.backup";

                File.Copy(item.Path, backupPath, true);

                var temporaryPath = item.Path +
                    ".cbb-transaction-tmp-" + Guid.NewGuid().ToString("N");

                File.WriteAllText(
                    temporaryPath,
                    item.NewText.Replace(
                        "\n",
                        Environment.NewLine,
                        StringComparison.Ordinal
                    ),
                    new UTF8Encoding(false)
                );

                File.Move(temporaryPath, item.Path, true);

                applied.Add(new AppliedFile(
                    item,
                    backupPath,
                    Hash(item.Path)
                ));
            }
        }
        catch (Exception writeError)
        {
            var rollback = Rollback(applied);

            throw new InvalidOperationException(
                "Транзакция не записана: " + writeError.Message + "\n" +
                rollback.Summary,
                writeError
            );
        }

        ProcessResult? verification = null;

        if (verify is not null)
        {
            verification = await RunVerificationAsync(verify);

            if (verification.ExitCode != 0)
            {
                var rollback = Rollback(applied);

                OperationHistory.RecordTransactionAutoRollback(
                    req,
                    transactionId,
                    applied.Count,
                    verification.ExitCode,
                    rollback.RestoredCount,
                    rollback.Errors.Count
                );

                return Result.Error(req,
                    "Проверка транзакции завершилась с ошибкой.\n" +
                    $"Команда: {verify.Executable} " +
                    string.Join(" ", verify.Arguments) + "\n" +
                    $"Код завершения: {verification.ExitCode}\n" +
                    rollback.Summary + "\n\n" +
                    "STDOUT:\n" + verification.Stdout + "\n\n" +
                    "STDERR:\n" + verification.Stderr
                );
            }
        }

        var resultFiles = new JsonArray();

        foreach (var item in applied)
        {
            OperationHistory.RecordTransactionFileChange(
                req,
                transactionId,
                item.Prepared.Path,
                item.BackupPath,
                item.Prepared.BeforeSha256,
                item.AfterSha256
            );

            resultFiles.Add(new JsonObject
            {
                ["path"] = item.Prepared.Path,
                ["backup_path"] = item.BackupPath,
                ["before_sha256"] = item.Prepared.BeforeSha256,
                ["after_sha256"] = item.AfterSha256
            });
        }

        OperationHistory.RecordTransactionSummary(
            req,
            transactionId,
            applied.Count,
            verification?.ExitCode
        );

        var data = new JsonObject
        {
            ["transaction_id"] = transactionId,
            ["status"] = "committed",
            ["file_count"] = applied.Count,
            ["files"] = resultFiles
        };

        if (verification is not null)
        {
            data["verification"] = new JsonObject
            {
                ["executable"] = verify!.Executable,
                ["args"] = new JsonArray(
                    verify.Arguments.Select(value => JsonValue.Create(value)).ToArray()
                ),
                ["cwd"] = verify.WorkingDirectory,
                ["exit_code"] = verification.ExitCode,
                ["stdout"] = verification.Stdout,
                ["stderr"] = verification.Stderr,
                ["duration_ms"] = verification.DurationMilliseconds,
                ["truncated"] = verification.Truncated
            };
        }

        return Result.Ok(req, data);
    }

    private static List<BatchPatchTool.PreparedPatch> PrepareFiles(
        JsonObject req,
        JsonArray files
    )
    {
        var prepared = new List<BatchPatchTool.PreparedPatch>();
        var uniquePaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var node in files)
        {
            var item = node as JsonObject
                ?? throw new InvalidOperationException(
                    "Каждый элемент files должен быть объектом"
                );

            var path = ResolveItemPath(req, item);

            if (!uniquePaths.Add(path))
                throw new InvalidOperationException(
                    $"Файл указан в транзакции повторно: {path}"
                );

            if (!File.Exists(path))
                throw new FileNotFoundException(
                    "Файл для патча не найден",
                    path
                );

            var beforeSha256 = Hash(path);
            var expectedSha256 = item["expected_sha256"]?.GetValue<string>();

            if (!string.IsNullOrWhiteSpace(expectedSha256) &&
                !beforeSha256.Equals(
                    expectedSha256,
                    StringComparison.OrdinalIgnoreCase
                ))
            {
                throw new InvalidOperationException(
                    $"SHA-256 исходного файла не совпадает: {path}\n" +
                    $"Ожидался: {expectedSha256}\n" +
                    $"Фактический: {beforeSha256}"
                );
            }

            var patch = item["patch"]?.GetValue<string>()
                ?? throw new InvalidOperationException(
                    $"Не указано поле patch для файла: {path}"
                );

            var oldText = File.ReadAllText(path, Encoding.UTF8)
                .Replace("\r\n", "\n", StringComparison.Ordinal)
                .Replace("\r", "\n", StringComparison.Ordinal);

            var newText = UnifiedPatch.Apply(oldText, patch);

            prepared.Add(new BatchPatchTool.PreparedPatch(
                path,
                patch,
                oldText,
                newText,
                beforeSha256
            ));
        }

        return prepared;
    }

    private static VerificationSpec? ParseVerify(JsonObject req)
    {
        if (req["verify"] is not JsonObject verify)
            return null;

        var executableRaw = verify["executable"]?.GetValue<string>()
            ?? throw new InvalidOperationException(
                "В verify не указано executable"
            );

        var executable = ToolResolver.Resolve(executableRaw) ?? executableRaw;
        var arguments = verify["args"] is JsonArray args
            ? args.Select(node => node?.GetValue<string>() ?? "").ToArray()
            : Array.Empty<string>();

        var cwdRaw = verify["cwd"]?.GetValue<string>();
        string? workingDirectory = null;

        if (!string.IsNullOrWhiteSpace(cwdRaw))
        {
            var pathRequest = new JsonObject
            {
                ["workspace"] = req["workspace"]?.DeepClone(),
                ["cwd"] = cwdRaw
            };

            workingDirectory = WorkspaceStore.ResolveOptionalPath(
                pathRequest,
                "cwd"
            );
        }

        var timeoutSeconds = Math.Clamp(
            verify["timeout_seconds"]?.GetValue<int>() ?? 180,
            1,
            3600
        );

        return new VerificationSpec(
            executable,
            arguments,
            workingDirectory,
            timeoutSeconds
        );
    }

    private static async Task<ProcessResult> RunVerificationAsync(
        VerificationSpec verify
    )
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = verify.Executable,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        if (!string.IsNullOrWhiteSpace(verify.WorkingDirectory))
            startInfo.WorkingDirectory = verify.WorkingDirectory;

        foreach (var argument in verify.Arguments)
            startInfo.ArgumentList.Add(argument);

        using var process = new Process { StartInfo = startInfo };
        var stopwatch = Stopwatch.StartNew();

        process.Start();

        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();

        using var cancellation = new CancellationTokenSource(
            TimeSpan.FromSeconds(verify.TimeoutSeconds)
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
                // Process may already have exited.
            }

            throw new TimeoutException(
                $"Проверка транзакции превысила таймаут " +
                $"{verify.TimeoutSeconds} секунд"
            );
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;
        var truncated = stdout.Length > MaxProcessOutputChars ||
                        stderr.Length > MaxProcessOutputChars;

        if (stdout.Length > MaxProcessOutputChars)
            stdout = stdout[..MaxProcessOutputChars];

        if (stderr.Length > MaxProcessOutputChars)
            stderr = stderr[..MaxProcessOutputChars];

        return new ProcessResult(
            process.ExitCode,
            stdout,
            stderr,
            stopwatch.ElapsedMilliseconds,
            truncated
        );
    }

    private static RollbackResult Rollback(
        IReadOnlyList<AppliedFile> applied
    )
    {
        var restored = 0;
        var errors = new List<string>();

        foreach (var item in applied.Reverse())
        {
            try
            {
                File.Copy(item.BackupPath, item.Prepared.Path, true);
                restored++;
            }
            catch (Exception error)
            {
                errors.Add($"{item.Prepared.Path}: {error.Message}");
            }
        }

        var summary = errors.Count == 0
            ? $"Автоматический откат выполнен. Восстановлено файлов: {restored}."
            : $"Восстановлено файлов: {restored}. Ошибки отката: " +
              string.Join("; ", errors);

        return new RollbackResult(restored, errors, summary);
    }

    private static string ResolveItemPath(
        JsonObject request,
        JsonObject item
    )
    {
        var raw = item["path"]?.GetValue<string>()
            ?? throw new InvalidOperationException(
                "В элементе files отсутствует path"
            );

        if (Path.IsPathRooted(raw))
            return Path.GetFullPath(raw);

        var workspace = item["workspace"]?.GetValue<string>()
            ?? request["workspace"]?.GetValue<string>();

        if (string.IsNullOrWhiteSpace(workspace))
            throw new InvalidOperationException(
                $"Для относительного пути не указан workspace: {raw}"
            );

        return WorkspaceStore.ResolvePath(
            new JsonObject
            {
                ["workspace"] = workspace,
                ["path"] = raw
            },
            "path"
        );
    }

    private static string Hash(string path)
    {
        return Convert.ToHexString(
            SHA256.HashData(File.ReadAllBytes(path))
        ).ToLowerInvariant();
    }

    private sealed record VerificationSpec(
        string Executable,
        IReadOnlyList<string> Arguments,
        string? WorkingDirectory,
        int TimeoutSeconds
    );

    private sealed record ProcessResult(
        int ExitCode,
        string Stdout,
        string Stderr,
        long DurationMilliseconds,
        bool Truncated
    );

    private sealed record AppliedFile(
        BatchPatchTool.PreparedPatch Prepared,
        string BackupPath,
        string AfterSha256
    );

    private sealed record RollbackResult(
        int RestoredCount,
        IReadOnlyList<string> Errors,
        string Summary
    );
}
