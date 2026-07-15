using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

static class OperationHistory
{
    private static readonly object Sync = new();

    private static readonly string HistoryPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "history.jsonl"
    );

    public static void RecordFileChange(
        JsonObject req,
        string path,
        string? backupPath,
        string? beforeSha256,
        string afterSha256
    )
    {
        Append(new JsonObject
        {
            ["id"] = Guid.NewGuid().ToString("N"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = req["tool"]?.DeepClone(),
            ["path"] = path,
            ["backup_path"] = backupPath,
            ["before_sha256"] = beforeSha256,
            ["after_sha256"] = afterSha256,
            ["kind"] = "file_change"
        });
    }

    public static void RecordBatchFileChange(
        JsonObject req,
        string batchId,
        string path,
        string backupPath,
        string beforeSha256,
        string afterSha256
    )
    {
        Append(new JsonObject
        {
            ["id"] = Guid.NewGuid().ToString("N"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "file.patch.batch",
            ["batch_id"] = batchId,
            ["path"] = path,
            ["backup_path"] = backupPath,
            ["before_sha256"] = beforeSha256,
            ["after_sha256"] = afterSha256,
            ["kind"] = "batch_file_change"
        });
    }

    public static void RecordBatchSummary(
        JsonObject req,
        string batchId,
        int fileCount
    )
    {
        Append(new JsonObject
        {
            ["id"] = Guid.NewGuid().ToString("N"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "file.patch.batch",
            ["batch_id"] = batchId,
            ["file_count"] = fileCount,
            ["kind"] = "batch_summary"
        });
    }

    public static void RecordTransactionFileChange(
        JsonObject req,
        string transactionId,
        string path,
        string backupPath,
        string beforeSha256,
        string afterSha256
    )
    {
        Append(new JsonObject
        {
            ["id"] = Guid.NewGuid().ToString("N"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "workspace.transaction",
            ["transaction_id"] = transactionId,
            ["path"] = path,
            ["backup_path"] = backupPath,
            ["before_sha256"] = beforeSha256,
            ["after_sha256"] = afterSha256,
            ["kind"] = "transaction_file_change"
        });
    }

    public static void RecordTransactionSummary(
        JsonObject req,
        string transactionId,
        int fileCount,
        int? verificationExitCode
    )
    {
        Append(new JsonObject
        {
            ["id"] = Guid.NewGuid().ToString("N"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "workspace.transaction",
            ["transaction_id"] = transactionId,
            ["file_count"] = fileCount,
            ["verification_exit_code"] = verificationExitCode,
            ["status"] = "committed",
            ["kind"] = "transaction_summary"
        });
    }

    public static void RecordTransactionAutoRollback(
        JsonObject req,
        string transactionId,
        int fileCount,
        int verificationExitCode,
        int restoredCount,
        int rollbackErrorCount
    )
    {
        Append(new JsonObject
        {
            ["id"] = Guid.NewGuid().ToString("N"),
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "workspace.transaction",
            ["transaction_id"] = transactionId,
            ["file_count"] = fileCount,
            ["verification_exit_code"] = verificationExitCode,
            ["restored_count"] = restoredCount,
            ["rollback_error_count"] = rollbackErrorCount,
            ["status"] = "rolled_back",
            ["kind"] = "transaction_auto_rollback"
        });
    }

    public static JsonObject RollbackTransaction(JsonObject req)
    {
        var transactionId = req["transaction_id"]?.GetValue<string>()
            ?? throw new InvalidOperationException(
                "Не указано поле transaction_id"
            );

        var allRecords = ReadAll();

        var completedRollbacks = allRecords
            .Where(record =>
                string.Equals(
                    record["kind"]?.GetValue<string>(),
                    "transaction_rollback_summary",
                    StringComparison.OrdinalIgnoreCase
                ) &&
                string.Equals(
                    record["source_transaction_id"]?.GetValue<string>(),
                    transactionId,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            .Select(record => record["id"]?.GetValue<string>())
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .ToArray();

        var undoneRollbackIds = allRecords
            .Where(record => string.Equals(
                record["kind"]?.GetValue<string>(),
                "transaction_rollback_undo_summary",
                StringComparison.OrdinalIgnoreCase
            ))
            .Select(record => record["source_rollback_id"]?.GetValue<string>())
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var activeRollbackId = completedRollbacks
            .LastOrDefault(id => !undoneRollbackIds.Contains(id!));

        if (!string.IsNullOrWhiteSpace(activeRollbackId))
            throw new InvalidOperationException(
                $"Транзакция уже откатана. Rollback ID: {activeRollbackId}"
            );

        var records = allRecords
            .Where(record =>
                string.Equals(
                    record["transaction_id"]?.GetValue<string>(),
                    transactionId,
                    StringComparison.OrdinalIgnoreCase
                ) &&
                string.Equals(
                    record["kind"]?.GetValue<string>(),
                    "transaction_file_change",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            .ToArray();

        if (records.Length == 0)
        {
            throw new InvalidOperationException(
                $"Файлы транзакции не найдены в истории: {transactionId}"
            );
        }

        var prepared = new List<TransactionRollbackFile>();

        foreach (var record in records)
        {
            var path = record["path"]?.GetValue<string>()
                ?? throw new InvalidOperationException(
                    "В записи транзакции отсутствует path"
                );

            var backupPath = record["backup_path"]?.GetValue<string>();

            if (string.IsNullOrWhiteSpace(backupPath))
            {
                throw new InvalidOperationException(
                    $"В записи транзакции отсутствует backup_path: {path}"
                );
            }

            if (!File.Exists(backupPath))
            {
                throw new FileNotFoundException(
                    $"Резервная копия транзакции не найдена для файла: {path}",
                    backupPath
                );
            }

            prepared.Add(new TransactionRollbackFile(path, backupPath));
        }

        var fileList = string.Join(
            Environment.NewLine,
            prepared.Select(item => "• " + item.Path)
        );

        Dispatcher.ConfirmOperation(
            $"Откатить всю транзакцию?\n\n" +
            $"Transaction ID: {transactionId}\n" +
            $"Файлов: {prepared.Count}\n\n" +
            fileList
        );

        var rollbackId = Guid.NewGuid().ToString("N");
        var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        var restored = new List<TransactionRollbackResult>();

        try
        {
            foreach (var item in prepared.AsEnumerable().Reverse())
            {
                Directory.CreateDirectory(Path.GetDirectoryName(item.Path)!);

                string? currentBackup = null;
                string? beforeSha256 = null;

                if (File.Exists(item.Path))
                {
                    beforeSha256 = Hash(item.Path);
                    currentBackup = item.Path +
                        $".cbb-before-transaction-rollback-{rollbackId}-{timestamp}";
                    File.Copy(item.Path, currentBackup, true);
                }

                var temporaryPath = item.Path +
                    ".cbb-transaction-rollback-tmp-" +
                    Guid.NewGuid().ToString("N");

                File.Copy(item.SourceBackupPath, temporaryPath, true);
                File.Move(temporaryPath, item.Path, true);

                restored.Add(new TransactionRollbackResult(
                    item.Path,
                    item.SourceBackupPath,
                    currentBackup,
                    beforeSha256,
                    Hash(item.Path)
                ));
            }
        }
        catch (Exception error)
        {
            foreach (var item in restored.AsEnumerable().Reverse())
            {
                if (!string.IsNullOrWhiteSpace(item.PreviousVersionBackup) &&
                    File.Exists(item.PreviousVersionBackup))
                {
                    try
                    {
                        File.Copy(
                            item.PreviousVersionBackup,
                            item.Path,
                            true
                        );
                    }
                    catch
                    {
                        // Preserve the original rollback exception.
                    }
                }
            }

            throw new InvalidOperationException(
                "Не удалось полностью откатить транзакцию. " +
                "Уже обработанные файлы были восстановлены, где это возможно. " +
                error.Message,
                error
            );
        }

        var resultFiles = new JsonArray();

        foreach (var item in restored)
        {
            var historyId = Guid.NewGuid().ToString("N");

            Append(new JsonObject
            {
                ["id"] = historyId,
                ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
                ["request_id"] = req["id"]?.DeepClone(),
                ["tool"] = "history.rollback.transaction",
                ["rollback_id"] = rollbackId,
                ["source_transaction_id"] = transactionId,
                ["path"] = item.Path,
                ["backup_path"] = item.PreviousVersionBackup,
                ["source_backup_path"] = item.SourceBackupPath,
                ["before_sha256"] = item.BeforeSha256,
                ["after_sha256"] = item.AfterSha256,
                ["kind"] = "transaction_rollback_file"
            });

            resultFiles.Add(new JsonObject
            {
                ["path"] = item.Path,
                ["restored_from"] = item.SourceBackupPath,
                ["previous_version_backup"] = item.PreviousVersionBackup,
                ["sha256"] = item.AfterSha256
            });
        }

        Append(new JsonObject
        {
            ["id"] = rollbackId,
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "history.rollback.transaction",
            ["source_transaction_id"] = transactionId,
            ["file_count"] = restored.Count,
            ["kind"] = "transaction_rollback_summary"
        });

        return Result.Ok(req, new JsonObject
        {
            ["rollback_id"] = rollbackId,
            ["source_transaction_id"] = transactionId,
            ["file_count"] = restored.Count,
            ["files"] = resultFiles
        });
    }

    public static JsonObject UndoTransactionRollback(JsonObject req)
    {
        var rollbackId = req["rollback_id"]?.GetValue<string>()
            ?? throw new InvalidOperationException(
                "Не указано поле rollback_id"
            );

        var allRecords = ReadAll();

        var alreadyUndone = allRecords.Any(record =>
            string.Equals(
                record["kind"]?.GetValue<string>(),
                "transaction_rollback_undo_summary",
                StringComparison.OrdinalIgnoreCase
            ) &&
            string.Equals(
                record["source_rollback_id"]?.GetValue<string>(),
                rollbackId,
                StringComparison.OrdinalIgnoreCase
            )
        );

        if (alreadyUndone)
            throw new InvalidOperationException(
                $"Откат уже был возвращён: {rollbackId}"
            );

        var records = allRecords
            .Where(record =>
                string.Equals(
                    record["kind"]?.GetValue<string>(),
                    "transaction_rollback_file",
                    StringComparison.OrdinalIgnoreCase
                ) &&
                string.Equals(
                    record["rollback_id"]?.GetValue<string>(),
                    rollbackId,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            .ToArray();

        if (records.Length == 0)
            throw new InvalidOperationException(
                $"Файлы отката не найдены в истории: {rollbackId}"
            );

        var prepared = new List<TransactionRollbackUndoFile>();

        foreach (var record in records)
        {
            var path = record["path"]?.GetValue<string>()
                ?? throw new InvalidOperationException(
                    "В записи отката отсутствует path"
                );

            var previousVersionBackup =
                record["backup_path"]?.GetValue<string>();

            if (string.IsNullOrWhiteSpace(previousVersionBackup))
                throw new InvalidOperationException(
                    $"Для файла нет версии до отката: {path}"
                );

            if (!File.Exists(previousVersionBackup))
                throw new FileNotFoundException(
                    $"Версия файла до отката не найдена: {path}",
                    previousVersionBackup
                );

            prepared.Add(new TransactionRollbackUndoFile(
                path,
                previousVersionBackup,
                record["source_transaction_id"]?.GetValue<string>()
            ));
        }

        var fileList = string.Join(
            Environment.NewLine,
            prepared.Select(item => "• " + item.Path)
        );

        Dispatcher.ConfirmOperation(
            $"Вернуть ручной откат транзакции?\n\n" +
            $"Rollback ID: {rollbackId}\n" +
            $"Файлов: {prepared.Count}\n\n" +
            fileList
        );

        var undoId = Guid.NewGuid().ToString("N");
        var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        var restored = new List<TransactionRollbackUndoResult>();

        try
        {
            foreach (var item in prepared.AsEnumerable().Reverse())
            {
                Directory.CreateDirectory(Path.GetDirectoryName(item.Path)!);

                string? rolledBackVersionBackup = null;
                string? beforeSha256 = null;

                if (File.Exists(item.Path))
                {
                    beforeSha256 = Hash(item.Path);
                    rolledBackVersionBackup = item.Path +
                        $".cbb-before-rollback-undo-{undoId}-{timestamp}";
                    File.Copy(item.Path, rolledBackVersionBackup, true);
                }

                var temporaryPath = item.Path +
                    ".cbb-rollback-undo-tmp-" +
                    Guid.NewGuid().ToString("N");

                File.Copy(item.PreviousVersionBackup, temporaryPath, true);
                File.Move(temporaryPath, item.Path, true);

                restored.Add(new TransactionRollbackUndoResult(
                    item.Path,
                    item.PreviousVersionBackup,
                    rolledBackVersionBackup,
                    beforeSha256,
                    Hash(item.Path),
                    item.SourceTransactionId
                ));
            }
        }
        catch (Exception error)
        {
            foreach (var item in restored.AsEnumerable().Reverse())
            {
                if (!string.IsNullOrWhiteSpace(item.RolledBackVersionBackup) &&
                    File.Exists(item.RolledBackVersionBackup))
                {
                    try
                    {
                        File.Copy(
                            item.RolledBackVersionBackup,
                            item.Path,
                            true
                        );
                    }
                    catch
                    {
                        // Preserve the original undo exception.
                    }
                }
            }

            throw new InvalidOperationException(
                "Не удалось полностью вернуть откат. " +
                "Уже обработанные файлы были восстановлены, где это возможно. " +
                error.Message,
                error
            );
        }

        var resultFiles = new JsonArray();

        foreach (var item in restored)
        {
            Append(new JsonObject
            {
                ["id"] = Guid.NewGuid().ToString("N"),
                ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
                ["request_id"] = req["id"]?.DeepClone(),
                ["tool"] = "history.rollback.transaction.undo",
                ["undo_id"] = undoId,
                ["source_rollback_id"] = rollbackId,
                ["source_transaction_id"] = item.SourceTransactionId,
                ["path"] = item.Path,
                ["backup_path"] = item.RolledBackVersionBackup,
                ["restored_from"] = item.PreviousVersionBackup,
                ["before_sha256"] = item.BeforeSha256,
                ["after_sha256"] = item.AfterSha256,
                ["kind"] = "transaction_rollback_undo_file"
            });

            resultFiles.Add(new JsonObject
            {
                ["path"] = item.Path,
                ["restored_from"] = item.PreviousVersionBackup,
                ["rolled_back_version_backup"] =
                    item.RolledBackVersionBackup,
                ["sha256"] = item.AfterSha256
            });
        }

        Append(new JsonObject
        {
            ["id"] = undoId,
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "history.rollback.transaction.undo",
            ["source_rollback_id"] = rollbackId,
            ["source_transaction_id"] =
                restored.FirstOrDefault()?.SourceTransactionId,
            ["file_count"] = restored.Count,
            ["kind"] = "transaction_rollback_undo_summary"
        });

        return Result.Ok(req, new JsonObject
        {
            ["undo_id"] = undoId,
            ["source_rollback_id"] = rollbackId,
            ["file_count"] = restored.Count,
            ["files"] = resultFiles
        });
    }

    public static JsonObject List(JsonObject req)
    {
        var limit = Math.Clamp(req["limit"]?.GetValue<int>() ?? 50, 1, 500);
        var toolFilter = req["tool_filter"]?.GetValue<string>();
        var pathFilter = req["path_filter"]?.GetValue<string>();

        var records = ReadAll()
            .Where(record =>
                string.IsNullOrWhiteSpace(toolFilter) ||
                string.Equals(
                    record["tool"]?.GetValue<string>(),
                    toolFilter,
                    StringComparison.OrdinalIgnoreCase
                )
            )
            .Where(record =>
                string.IsNullOrWhiteSpace(pathFilter) ||
                (record["path"]?.GetValue<string>() ?? "")
                    .Contains(pathFilter, StringComparison.OrdinalIgnoreCase)
            )
            .TakeLast(limit)
            .Reverse()
            .ToArray();

        var items = new JsonArray();
        foreach (var record in records)
            items.Add(record.DeepClone());

        return Result.Ok(req, new JsonObject
        {
            ["history_path"] = HistoryPath,
            ["count"] = items.Count,
            ["items"] = items
        });
    }

    public static JsonObject Rollback(JsonObject req)
    {
        var historyId = req["history_id"]?.GetValue<string>()
            ?? throw new InvalidOperationException("Не указано поле history_id");

        var record = ReadAll().LastOrDefault(item =>
            string.Equals(
                item["id"]?.GetValue<string>(),
                historyId,
                StringComparison.OrdinalIgnoreCase
            )
        ) ?? throw new InvalidOperationException(
            $"Запись истории не найдена: {historyId}"
        );

        var path = record["path"]?.GetValue<string>()
            ?? throw new InvalidOperationException("В записи истории отсутствует path");

        var backupPath = record["backup_path"]?.GetValue<string>();

        if (string.IsNullOrWhiteSpace(backupPath))
            throw new InvalidOperationException(
                "Для этой операции нет резервной копии. Откат невозможен."
            );

        if (!File.Exists(backupPath))
            throw new FileNotFoundException(
                "Резервная копия не найдена",
                backupPath
            );

        Dispatcher.ConfirmOperation(
            $"Откатить изменение файла?\n\nФайл:\n{path}\n\nВосстановить из:\n{backupPath}"
        );

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        string? currentBackup = null;
        string? beforeSha256 = null;

        if (File.Exists(path))
        {
            beforeSha256 = Hash(path);
            currentBackup = path + ".cbb-before-rollback-" +
                DateTime.Now.ToString("yyyyMMdd-HHmmss");
            File.Copy(path, currentBackup, true);
        }

        var temp = path + ".cbb-rollback-tmp-" + Guid.NewGuid().ToString("N");
        File.Copy(backupPath, temp, true);
        File.Move(temp, path, true);

        var afterSha256 = Hash(path);
        var rollbackId = Guid.NewGuid().ToString("N");

        Append(new JsonObject
        {
            ["id"] = rollbackId,
            ["timestamp"] = DateTimeOffset.UtcNow.ToString("O"),
            ["request_id"] = req["id"]?.DeepClone(),
            ["tool"] = "history.rollback",
            ["path"] = path,
            ["backup_path"] = currentBackup,
            ["source_history_id"] = historyId,
            ["source_backup_path"] = backupPath,
            ["before_sha256"] = beforeSha256,
            ["after_sha256"] = afterSha256,
            ["kind"] = "rollback"
        });

        return Result.Ok(req, new JsonObject
        {
            ["history_id"] = rollbackId,
            ["source_history_id"] = historyId,
            ["path"] = path,
            ["restored_from"] = backupPath,
            ["previous_version_backup"] = currentBackup,
            ["sha256"] = afterSha256
        });
    }

    private static void Append(JsonObject record)
    {
        lock (Sync)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(HistoryPath)!);
            var line = record.ToJsonString(
                new JsonSerializerOptions { WriteIndented = false }
            );
            File.AppendAllText(
                HistoryPath,
                line + Environment.NewLine,
                new UTF8Encoding(false)
            );
        }
    }

    private static List<JsonObject> ReadAll()
    {
        lock (Sync)
        {
            if (!File.Exists(HistoryPath))
                return new List<JsonObject>();

            var result = new List<JsonObject>();

            foreach (var line in File.ReadLines(HistoryPath, Encoding.UTF8))
            {
                if (string.IsNullOrWhiteSpace(line))
                    continue;

                try
                {
                    var node = JsonNode.Parse(line)?.AsObject();
                    if (node is not null)
                        result.Add(node);
                }
                catch (JsonException)
                {
                    // Ignore a damaged individual history line.
                }
            }

            return result;
        }
    }

    private static string Hash(string path)
    {
        return Convert.ToHexString(
            SHA256.HashData(File.ReadAllBytes(path))
        ).ToLowerInvariant();
    }

    private sealed record TransactionRollbackFile(
        string Path,
        string SourceBackupPath
    );

    private sealed record TransactionRollbackResult(
        string Path,
        string SourceBackupPath,
        string? PreviousVersionBackup,
        string? BeforeSha256,
        string AfterSha256
    );

    private sealed record TransactionRollbackUndoFile(
        string Path,
        string PreviousVersionBackup,
        string? SourceTransactionId
    );

    private sealed record TransactionRollbackUndoResult(
        string Path,
        string PreviousVersionBackup,
        string? RolledBackVersionBackup,
        string? BeforeSha256,
        string AfterSha256,
        string? SourceTransactionId
    );
}
