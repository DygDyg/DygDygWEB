using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

static class BatchPatchTool
{
    public static JsonObject Apply(JsonObject req)
    {
        var files = req["files"] as JsonArray
            ?? throw new InvalidOperationException("Не указано поле files");

        if (files.Count == 0)
            throw new InvalidOperationException("Список files пуст");

        if (files.Count > 100)
            throw new InvalidOperationException("За одну операцию разрешено не более 100 файлов");

        var prepared = new List<PreparedPatch>();
        var uniquePaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var node in files)
        {
            var item = node as JsonObject
                ?? throw new InvalidOperationException("Каждый элемент files должен быть объектом");

            var path = ResolveItemPath(req, item);

            if (!uniquePaths.Add(path))
                throw new InvalidOperationException($"Файл указан в пакете повторно: {path}");

            if (!File.Exists(path))
                throw new FileNotFoundException("Файл для патча не найден", path);

            var expectedSha256 = item["expected_sha256"]?.GetValue<string>();
            var beforeSha256 = Hash(path);

            if (!string.IsNullOrWhiteSpace(expectedSha256) &&
                !beforeSha256.Equals(expectedSha256, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"SHA-256 исходного файла не совпадает: {path}\n" +
                    $"Ожидался: {expectedSha256}\n" +
                    $"Фактический: {beforeSha256}"
                );
            }

            var patch = item["patch"]?.GetValue<string>()
                ?? throw new InvalidOperationException($"Не указано поле patch для файла: {path}");

            var oldText = File.ReadAllText(path, Encoding.UTF8)
                .Replace("\r\n", "\n", StringComparison.Ordinal)
                .Replace("\r", "\n", StringComparison.Ordinal);

            var newText = UnifiedPatch.Apply(oldText, patch);

            prepared.Add(new PreparedPatch(
                path,
                patch,
                oldText,
                newText,
                beforeSha256
            ));
        }

        BatchPatchPreviewDialog.Confirm(prepared);

        var batchId = Guid.NewGuid().ToString("N");
        var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
        var written = new List<AppliedPatch>();

        try
        {
            foreach (var item in prepared)
            {
                var backupPath = item.Path + $".cbb-batch-{batchId}-{timestamp}.backup";
                File.Copy(item.Path, backupPath, true);

                var tempPath = item.Path + ".cbb-batch-tmp-" + Guid.NewGuid().ToString("N");

                File.WriteAllText(
                    tempPath,
                    item.NewText.Replace("\n", Environment.NewLine, StringComparison.Ordinal),
                    new UTF8Encoding(false)
                );

                File.Move(tempPath, item.Path, true);

                var afterSha256 = Hash(item.Path);
                written.Add(new AppliedPatch(item, backupPath, afterSha256));
            }
        }
        catch (Exception writeError)
        {
            var rollbackErrors = new List<string>();

            foreach (var item in written.AsEnumerable().Reverse())
            {
                try
                {
                    File.Copy(item.BackupPath, item.Prepared.Path, true);
                }
                catch (Exception rollbackError)
                {
                    rollbackErrors.Add(
                        $"{item.Prepared.Path}: {rollbackError.Message}"
                    );
                }
            }

            var details = rollbackErrors.Count == 0
                ? "Все уже изменённые файлы восстановлены из резервных копий."
                : "Ошибки автоматического отката: " + string.Join("; ", rollbackErrors);

            throw new InvalidOperationException(
                $"Пакетная запись не завершена: {writeError.Message} {details}",
                writeError
            );
        }

        var resultFiles = new JsonArray();

        foreach (var item in written)
        {
            OperationHistory.RecordBatchFileChange(
                req,
                batchId,
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

        OperationHistory.RecordBatchSummary(req, batchId, written.Count);

        return Result.Ok(req, new JsonObject
        {
            ["batch_id"] = batchId,
            ["file_count"] = written.Count,
            ["files"] = resultFiles
        });
    }

    private static string ResolveItemPath(JsonObject request, JsonObject item)
    {
        var raw = item["path"]?.GetValue<string>()
            ?? throw new InvalidOperationException("В элементе files отсутствует path");

        if (Path.IsPathRooted(raw))
            return Path.GetFullPath(raw);

        var workspace = item["workspace"]?.GetValue<string>()
            ?? request["workspace"]?.GetValue<string>();

        if (string.IsNullOrWhiteSpace(workspace))
        {
            throw new InvalidOperationException(
                $"Для относительного пути не указан workspace: {raw}"
            );
        }

        var pathRequest = new JsonObject
        {
            ["workspace"] = workspace,
            ["path"] = raw
        };

        return WorkspaceStore.ResolvePath(pathRequest, "path");
    }

    private static string Hash(string path)
    {
        return Convert.ToHexString(
            SHA256.HashData(File.ReadAllBytes(path))
        ).ToLowerInvariant();
    }

    internal sealed record PreparedPatch(
        string Path,
        string Patch,
        string OldText,
        string NewText,
        string BeforeSha256
    );

    private sealed record AppliedPatch(
        PreparedPatch Prepared,
        string BackupPath,
        string AfterSha256
    );
}
