using System.IO.Enumeration;
using System.Text.Json.Nodes;

static class BatchTreeReadTool
{
    private const int MaximumFiles = 100;

    private static readonly HashSet<string> IgnoredDirectories = new(
        new[]
        {
            ".git",
            ".idea",
            ".vs",
            ".vscode",
            "bin",
            "obj",
            "node_modules",
            "packages"
        },
        StringComparer.OrdinalIgnoreCase
    );

    public static JsonObject Read(JsonObject req)
    {
        var relativePath = req["path"]?.GetValue<string>() ?? ".";
        var root = WorkspaceStore.ResolvePath(
            new JsonObject
            {
                ["workspace"] = req["workspace"]?.DeepClone(),
                ["path"] = relativePath
            },
            "path"
        );

        if (!Directory.Exists(root))
            throw new DirectoryNotFoundException(
                $"Каталог пакетного чтения не найден: {root}"
            );

        var pattern = req["pattern"]?.GetValue<string>() ?? "*";
        var recursive = req["recursive"]?.GetValue<bool>() ?? true;
        var maxFiles = Math.Clamp(
            req["max_files"]?.GetValue<int>() ?? MaximumFiles,
            1,
            MaximumFiles
        );

        var extensions = ReadStringSet(req["extensions"] as JsonArray);
        var excludes = ReadStringList(req["exclude"] as JsonArray);
        var discovered = DiscoverFiles(
            root,
            pattern,
            recursive,
            extensions,
            excludes,
            maxFiles
        );

        if (discovered.Count == 0)
        {
            throw new InvalidOperationException(
                $"Файлы не найдены. Каталог: {root}; шаблон: {pattern}"
            );
        }

        var files = new JsonArray();
        var workspaceName = req["workspace"]?.GetValue<string>();

        foreach (var fullPath in discovered)
        {
            var item = new JsonObject
            {
                ["path"] = string.IsNullOrWhiteSpace(workspaceName)
                    ? fullPath
                    : Path.GetRelativePath(
                        WorkspaceStore.ResolveWorkspacePath(workspaceName, "."),
                        fullPath
                    )
            };

            if (req["max_chars_per_file"] is not null)
            {
                item["max_chars"] =
                    req["max_chars_per_file"]!.DeepClone();
            }

            files.Add(item);
        }

        var batchRequest = new JsonObject
        {
            ["version"] = req["version"]?.DeepClone(),
            ["id"] = req["id"]?.DeepClone(),
            ["tool"] = "file.read.batch.tree",
            ["workspace"] = req["workspace"]?.DeepClone(),
            ["files"] = files,
            ["continue_on_error"] =
                req["continue_on_error"]?.DeepClone(),
            ["max_chars"] = req["max_chars"]?.DeepClone(),
            ["max_total_chars"] = req["max_total_chars"]?.DeepClone()
        };

        RemoveNullProperties(batchRequest);

        var result = BatchReadTool.Read(batchRequest);

        if (result["data"] is JsonObject data)
        {
            data["root"] = root;
            data["pattern"] = pattern;
            data["recursive"] = recursive;
            data["discovered_count"] = discovered.Count;
            data["max_files"] = maxFiles;
        }

        return result;
    }

    private static List<string> DiscoverFiles(
        string root,
        string pattern,
        bool recursive,
        HashSet<string> extensions,
        IReadOnlyList<string> excludes,
        int limit
    )
    {
        var files = new List<string>();
        var pending = new Stack<string>();
        pending.Push(root);

        while (pending.Count > 0 && files.Count < limit)
        {
            var directory = pending.Pop();
            IEnumerable<string> entries;

            try
            {
                entries = Directory
                    .EnumerateFileSystemEntries(directory)
                    .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
                    .ToArray();
            }
            catch (Exception error) when (
                error is UnauthorizedAccessException or
                IOException or
                DirectoryNotFoundException
            )
            {
                continue;
            }

            foreach (var entry in entries)
            {
                var name = Path.GetFileName(entry);

                if (Directory.Exists(entry))
                {
                    if (recursive && !IgnoredDirectories.Contains(name))
                        pending.Push(entry);

                    continue;
                }

                if (ShouldIgnoreFile(name))
                    continue;

                if (!FileSystemName.MatchesSimpleExpression(
                        pattern,
                        name,
                        ignoreCase: true
                    ))
                {
                    continue;
                }

                if (extensions.Count > 0 &&
                    !extensions.Contains(Path.GetExtension(name)))
                {
                    continue;
                }

                var relative = Path.GetRelativePath(root, entry);

                if (excludes.Any(exclude =>
                    FileSystemName.MatchesSimpleExpression(
                        exclude,
                        relative,
                        ignoreCase: true
                    ) ||
                    FileSystemName.MatchesSimpleExpression(
                        exclude,
                        name,
                        ignoreCase: true
                    )))
                {
                    continue;
                }

                files.Add(entry);

                if (files.Count >= limit)
                    break;
            }
        }

        return files
            .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static bool ShouldIgnoreFile(string name)
    {
        return name.Contains(".cbb-backup-", StringComparison.OrdinalIgnoreCase) ||
               name.Contains(".cbb-batch-", StringComparison.OrdinalIgnoreCase) ||
               name.Contains(".cbb-transaction-", StringComparison.OrdinalIgnoreCase) ||
               name.Contains(".cbb-before-", StringComparison.OrdinalIgnoreCase) ||
               name.Contains(".cbb-tmp-", StringComparison.OrdinalIgnoreCase);
    }

    private static HashSet<string> ReadStringSet(JsonArray? values)
    {
        var result = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (values is null)
            return result;

        foreach (var node in values)
        {
            var value = node?.GetValue<string>()?.Trim();

            if (string.IsNullOrWhiteSpace(value))
                continue;

            result.Add(value.StartsWith('.') ? value : "." + value);
        }

        return result;
    }

    private static List<string> ReadStringList(JsonArray? values)
    {
        if (values is null)
            return new List<string>();

        return values
            .Select(node => node?.GetValue<string>()?.Trim())
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value!)
            .ToList();
    }

    private static void RemoveNullProperties(JsonObject value)
    {
        foreach (var key in value
            .Where(item => item.Value is null)
            .Select(item => item.Key)
            .ToArray())
        {
            value.Remove(key);
        }
    }
}
