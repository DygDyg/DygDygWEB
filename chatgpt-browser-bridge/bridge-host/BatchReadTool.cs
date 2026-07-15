using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;

static class BatchReadTool
{
    private const int MaxFiles = 100;
    private const int DefaultMaxCharsPerFile = 200000;
    private const int MaxCharsPerFile = 500000;
    private const int DefaultMaxTotalChars = 1000000;
    private const int MaxTotalChars = 1500000;

    public static JsonObject Read(JsonObject req)
    {
        var files = req["files"] as JsonArray
            ?? throw new InvalidOperationException("Не указано поле files");

        if (files.Count == 0)
            throw new InvalidOperationException("Список files пуст");

        if (files.Count > MaxFiles)
        {
            throw new InvalidOperationException(
                $"За одну операцию разрешено читать не более {MaxFiles} файлов"
            );
        }

        var continueOnError =
            req["continue_on_error"]?.GetValue<bool>() ?? false;

        var defaultMaxChars = Math.Clamp(
            req["max_chars"]?.GetValue<int>() ?? DefaultMaxCharsPerFile,
            1,
            MaxCharsPerFile
        );

        var maxTotalChars = Math.Clamp(
            req["max_total_chars"]?.GetValue<int>() ?? DefaultMaxTotalChars,
            1,
            MaxTotalChars
        );

        var results = new JsonArray();
        var uniquePaths = new HashSet<string>(
            StringComparer.OrdinalIgnoreCase
        );

        var readCount = 0;
        var errorCount = 0;
        var truncatedCount = 0;
        var returnedChars = 0;
        var totalLimitReached = false;

        foreach (var node in files)
        {
            var item = node as JsonObject
                ?? throw new InvalidOperationException(
                    "Каждый элемент files должен быть объектом"
                );

            string? path = null;

            try
            {
                path = ResolveItemPath(req, item);

                if (!uniquePaths.Add(path))
                {
                    throw new InvalidOperationException(
                        $"Файл указан в пакете повторно: {path}"
                    );
                }

                if (!File.Exists(path))
                    throw new FileNotFoundException(
                        "Файл для чтения не найден",
                        path
                    );

                var requestedMaxChars = Math.Clamp(
                    item["max_chars"]?.GetValue<int>() ?? defaultMaxChars,
                    1,
                    MaxCharsPerFile
                );

                var remainingTotal = maxTotalChars - returnedChars;

                if (remainingTotal <= 0)
                {
                    totalLimitReached = true;

                    results.Add(new JsonObject
                    {
                        ["path"] = path,
                        ["status"] = "skipped",
                        ["error"] =
                            "Достигнут общий лимит размера пакетного ответа"
                    });

                    continue;
                }

                var text = File.ReadAllText(path, Encoding.UTF8);
                var originalChars = text.Length;
                var effectiveLimit = Math.Min(
                    requestedMaxChars,
                    remainingTotal
                );

                var truncated = originalChars > effectiveLimit;

                if (truncated)
                {
                    text = text[..effectiveLimit];
                    truncatedCount++;
                }

                returnedChars += text.Length;
                readCount++;

                if (returnedChars >= maxTotalChars)
                    totalLimitReached = true;

                results.Add(new JsonObject
                {
                    ["path"] = path,
                    ["status"] = "ok",
                    ["sha256"] = Hash(path),
                    ["content"] = text,
                    ["original_chars"] = originalChars,
                    ["returned_chars"] = text.Length,
                    ["truncated"] = truncated,
                    ["truncated_by_total_limit"] =
                        truncated && remainingTotal < requestedMaxChars
                });
            }
            catch (Exception error)
            {
                if (!continueOnError)
                    throw;

                errorCount++;

                results.Add(new JsonObject
                {
                    ["path"] = path ??
                        item["path"]?.GetValue<string>() ?? "",
                    ["status"] = "error",
                    ["error"] = error.Message
                });
            }
        }

        return Result.Ok(req, new JsonObject
        {
            ["requested_count"] = files.Count,
            ["read_count"] = readCount,
            ["error_count"] = errorCount,
            ["truncated_count"] = truncatedCount,
            ["returned_chars"] = returnedChars,
            ["max_total_chars"] = maxTotalChars,
            ["total_limit_reached"] = totalLimitReached,
            ["continue_on_error"] = continueOnError,
            ["files"] = results
        });
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

        var pathRequest = new JsonObject
        {
            ["path"] = raw,
            ["workspace"] =
                item["workspace"]?.DeepClone() ??
                request["workspace"]?.DeepClone()
        };

        return WorkspaceStore.ResolvePath(pathRequest, "path");
    }

    private static string Hash(string path)
    {
        return Convert.ToHexString(
            SHA256.HashData(File.ReadAllBytes(path))
        ).ToLowerInvariant();
    }
}
