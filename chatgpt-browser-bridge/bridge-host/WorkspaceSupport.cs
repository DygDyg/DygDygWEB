using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

static class WorkspaceStore
{
    private static readonly object Sync = new();

    private static readonly HashSet<string> IgnoredDirectoryNames = new(
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

    private static readonly string ConfigPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "ChatGPTBrowserBridge",
        "NativeHost",
        "workspaces.json"
    );

    public static JsonObject List(JsonObject req)
    {
        var items = Load();
        var array = new JsonArray();

        foreach (var item in items.OrderBy(x => x.Key, StringComparer.OrdinalIgnoreCase))
        {
            array.Add(new JsonObject
            {
                ["name"] = item.Key,
                ["path"] = item.Value,
                ["exists"] = Directory.Exists(item.Value)
            });
        }

        return Result.Ok(req, new JsonObject
        {
            ["config_path"] = ConfigPath,
            ["workspaces"] = array
        });
    }

    public static JsonObject Add(JsonObject req)
    {
        var name = RequiredString(req, "name").Trim();
        var rawPath = RequiredString(req, "path");

        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Имя Workspace не может быть пустым");

        if (!Path.IsPathRooted(rawPath))
            throw new InvalidOperationException("Корень Workspace должен быть абсолютным путём");

        if (rawPath.StartsWith("\\\\", StringComparison.Ordinal))
            throw new InvalidOperationException("UNC-пути пока запрещены");

        var fullPath = Path.GetFullPath(rawPath)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        if (!Directory.Exists(fullPath))
            throw new DirectoryNotFoundException($"Папка Workspace не найдена: {fullPath}");

        Dispatcher.ConfirmOperation($"Добавить рабочее пространство?\n\n{name}\n{fullPath}");

        lock (Sync)
        {
            var items = LoadUnsafe();
            items[name] = fullPath;
            SaveUnsafe(items);
        }

        return Result.Ok(req, new JsonObject
        {
            ["name"] = name,
            ["path"] = fullPath
        });
    }

    public static JsonObject Remove(JsonObject req)
    {
        var name = RequiredString(req, "name").Trim();

        Dispatcher.ConfirmOperation(
            $"Удалить рабочее пространство из настроек?\n\n{name}\n\nФайлы на диске удалены не будут."
        );

        bool removed;

        lock (Sync)
        {
            var items = LoadUnsafe();
            removed = items.Remove(name);
            SaveUnsafe(items);
        }

        return Result.Ok(req, new JsonObject
        {
            ["name"] = name,
            ["removed"] = removed
        });
    }

    public static JsonObject Tree(JsonObject req)
    {
        var root = ResolveWorkspaceRoot(req);
        var relative = req["path"]?.GetValue<string>() ?? "";
        var start = ResolveInside(root.Path, relative);
        var depth = Math.Clamp(req["depth"]?.GetValue<int>() ?? 3, 0, 15);
        var limit = Math.Clamp(req["limit"]?.GetValue<int>() ?? 1000, 1, 20000);
        var includeIgnored = req["include_ignored"]?.GetValue<bool>() ?? false;

        if (!Directory.Exists(start) && !File.Exists(start))
            throw new FileNotFoundException($"Путь Workspace не найден: {start}");

        var visited = 0;
        var ignored = 0;
        var truncated = false;

        JsonObject Build(string path, int remaining)
        {
            var isDirectory = Directory.Exists(path);
            var relativePath = Path.GetRelativePath(root.Path, path);

            var node = new JsonObject
            {
                ["name"] = GetDisplayName(path),
                ["path"] = relativePath,
                ["type"] = isDirectory ? "directory" : "file"
            };

            if (!isDirectory || remaining <= 0)
                return node;

            var children = new JsonArray();
            IEnumerable<string> entries;

            try
            {
                entries = Directory
                    .EnumerateFileSystemEntries(path)
                    .OrderByDescending(Directory.Exists)
                    .ThenBy(x => Path.GetFileName(x), StringComparer.OrdinalIgnoreCase);
            }
            catch (Exception ex) when (
                ex is UnauthorizedAccessException or IOException or DirectoryNotFoundException
            )
            {
                node["error"] = ex.Message;
                return node;
            }

            foreach (var entry in entries)
            {
                if (!includeIgnored && ShouldIgnore(entry))
                {
                    ignored++;
                    continue;
                }

                if (visited >= limit)
                {
                    truncated = true;
                    break;
                }

                visited++;
                children.Add(Build(entry, remaining - 1));
            }

            node["children"] = children;
            return node;
        }

        var tree = Build(start, depth);

        return Result.Ok(req, new JsonObject
        {
            ["workspace"] = root.Name,
            ["root"] = root.Path,
            ["start_path"] = start,
            ["depth"] = depth,
            ["limit"] = limit,
            ["include_ignored"] = includeIgnored,
            ["visited"] = visited,
            ["ignored"] = ignored,
            ["truncated"] = truncated,
            ["tree"] = tree
        });
    }

    public static JsonObject Find(JsonObject req)
    {
        var root = ResolveWorkspaceRoot(req);
        var query = RequiredString(req, "query").Trim();
        var relativeStart = req["path"]?.GetValue<string>() ?? "";
        var start = ResolveInside(root.Path, relativeStart);
        var limit = Math.Clamp(req["limit"]?.GetValue<int>() ?? 200, 1, 5000);
        var includeIgnored = req["include_ignored"]?.GetValue<bool>() ?? false;
        var comparison = StringComparison.OrdinalIgnoreCase;

        if (string.IsNullOrWhiteSpace(query))
            throw new InvalidOperationException("Поисковый запрос не может быть пустым");

        if (!Directory.Exists(start))
            throw new DirectoryNotFoundException($"Папка поиска не найдена: {start}");

        var matches = new JsonArray();
        var visited = 0;
        var ignored = 0;
        var errors = new JsonArray();
        var pending = new Stack<string>();
        pending.Push(start);

        while (pending.Count > 0 && matches.Count < limit)
        {
            var directory = pending.Pop();
            IEnumerable<string> entries;

            try
            {
                entries = Directory.EnumerateFileSystemEntries(directory).ToArray();
            }
            catch (Exception ex) when (
                ex is UnauthorizedAccessException or IOException or DirectoryNotFoundException
            )
            {
                errors.Add(new JsonObject
                {
                    ["path"] = Path.GetRelativePath(root.Path, directory),
                    ["error"] = ex.Message
                });
                continue;
            }

            foreach (var entry in entries)
            {
                if (!includeIgnored && ShouldIgnore(entry))
                {
                    ignored++;
                    continue;
                }

                visited++;

                if (Directory.Exists(entry))
                    pending.Push(entry);

                var relative = Path.GetRelativePath(root.Path, entry);
                var name = Path.GetFileName(entry);

                if (!relative.Contains(query, comparison) &&
                    !name.Contains(query, comparison))
                {
                    continue;
                }

                matches.Add(new JsonObject
                {
                    ["name"] = name,
                    ["path"] = relative,
                    ["full_path"] = entry,
                    ["type"] = Directory.Exists(entry) ? "directory" : "file"
                });

                if (matches.Count >= limit)
                    break;
            }
        }

        return Result.Ok(req, new JsonObject
        {
            ["workspace"] = root.Name,
            ["root"] = root.Path,
            ["start_path"] = start,
            ["query"] = query,
            ["include_ignored"] = includeIgnored,
            ["visited"] = visited,
            ["ignored"] = ignored,
            ["matches"] = matches,
            ["errors"] = errors,
            ["truncated"] = matches.Count >= limit
        });
    }

    public static string ResolvePath(JsonObject req, string key)
    {
        var raw = RequiredString(req, key);

        if (raw.StartsWith("\\\\", StringComparison.Ordinal))
            throw new InvalidOperationException("UNC-пути пока запрещены");

        if (Path.IsPathRooted(raw))
            return Path.GetFullPath(raw);

        var workspaceName = req["workspace"]?.GetValue<string>();

        if (string.IsNullOrWhiteSpace(workspaceName))
        {
            throw new InvalidOperationException(
                $"Относительный путь '{raw}' запрещён без поля workspace. " +
                "Укажите абсолютный путь или зарегистрированное рабочее пространство."
            );
        }

        return ResolveInside(Get(workspaceName), raw);
    }

    public static string ResolveOptionalPath(
        JsonObject req,
        string key,
        string? defaultValue = null
    )
    {
        var raw = req[key]?.GetValue<string>();

        if (string.IsNullOrWhiteSpace(raw))
        {
            if (defaultValue is null)
                throw new InvalidOperationException($"Не указано поле {key}");

            raw = defaultValue;
        }

        var clone = new JsonObject
        {
            [key] = raw,
            ["workspace"] = req["workspace"]?.DeepClone()
        };

        return ResolvePath(clone, key);
    }

    public static JsonArray DescribeWorkspaces()
    {
        var result = new JsonArray();

        foreach (var item in Load().OrderBy(x => x.Key, StringComparer.OrdinalIgnoreCase))
        {
            result.Add(new JsonObject
            {
                ["name"] = item.Key,
                ["path"] = item.Value,
                ["exists"] = Directory.Exists(item.Value)
            });
        }

        return result;
    }

    public static string ResolveWorkspacePath(
        string workspace,
        string relativePath
    )
    {
        return ResolveInside(Get(workspace), relativePath);
    }

    private static bool ShouldIgnore(string path)
    {
        var name = Path.GetFileName(path);

        if (Directory.Exists(path) && IgnoredDirectoryNames.Contains(name))
            return true;

        if (name.Contains(".cbb-backup-", StringComparison.OrdinalIgnoreCase))
            return true;

        if (name.Contains(".cbb-backup-workspace-", StringComparison.OrdinalIgnoreCase))
            return true;

        if (name.StartsWith(".cbb-tmp-", StringComparison.OrdinalIgnoreCase))
            return true;

        return false;
    }

    private static string GetDisplayName(string path)
    {
        var trimmed = path.TrimEnd(
            Path.DirectorySeparatorChar,
            Path.AltDirectorySeparatorChar
        );

        var name = Path.GetFileName(trimmed);
        return string.IsNullOrEmpty(name) ? trimmed : name;
    }

    private static (string Name, string Path) ResolveWorkspaceRoot(JsonObject req)
    {
        var name = RequiredString(req, "workspace");
        return (name, Get(name));
    }

    private static string Get(string name)
    {
        var items = Load();

        if (!items.TryGetValue(name, out var path))
            throw new InvalidOperationException($"Workspace не зарегистрирован: {name}");

        return path;
    }

    private static string ResolveInside(string root, string relative)
    {
        if (Path.IsPathRooted(relative))
            throw new InvalidOperationException("Внутри Workspace ожидается относительный путь");

        var normalizedRoot = Path.GetFullPath(root)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        var full = Path.GetFullPath(Path.Combine(normalizedRoot, relative));
        var prefix = normalizedRoot + Path.DirectorySeparatorChar;

        if (!full.Equals(normalizedRoot, StringComparison.OrdinalIgnoreCase) &&
            !full.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Путь выходит за пределы Workspace");
        }

        return full;
    }

    private static Dictionary<string, string> Load()
    {
        lock (Sync)
            return LoadUnsafe();
    }

    private static Dictionary<string, string> LoadUnsafe()
    {
        if (!File.Exists(ConfigPath))
            return new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        try
        {
            var json = File.ReadAllText(ConfigPath, Encoding.UTF8);
            var source = JsonSerializer.Deserialize<Dictionary<string, string>>(json)
                ?? new Dictionary<string, string>();

            return new Dictionary<string, string>(
                source,
                StringComparer.OrdinalIgnoreCase
            );
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"Повреждён файл Workspace: {ConfigPath}. {ex.Message}"
            );
        }
    }

    private static void SaveUnsafe(Dictionary<string, string> items)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(ConfigPath)!);

        var temp = ConfigPath + ".tmp-" + Guid.NewGuid().ToString("N");
        var json = JsonSerializer.Serialize(
            items,
            new JsonSerializerOptions { WriteIndented = true }
        );

        File.WriteAllText(temp, json, new UTF8Encoding(false));
        File.Move(temp, ConfigPath, true);
    }

    private static string RequiredString(JsonObject req, string key)
    {
        return req[key]?.GetValue<string>()
            ?? throw new InvalidOperationException($"Не указано поле {key}");
    }
}
