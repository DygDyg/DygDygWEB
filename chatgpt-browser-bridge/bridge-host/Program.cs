using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

Console.InputEncoding = Encoding.UTF8;
Console.OutputEncoding = Encoding.UTF8;

while (true)
{
    var request = await NativeMessaging.ReadAsync(Console.OpenStandardInput());
    if (request is null) break;

    BridgeStateStore.MarkRunning(request);

    JsonObject response;

    try
    {
        response = await Dispatcher.HandleAsync(request);

        if (string.Equals(
                response["status"]?.GetValue<string>(),
                "error",
                StringComparison.OrdinalIgnoreCase
            ))
        {
            BridgeStateStore.MarkError(
                request,
                response["error"]?.GetValue<string>() ?? "Неизвестная ошибка"
            );
        }
        else
        {
            BridgeStateStore.MarkSuccess(request, response);
        }
    }
    catch (Exception ex)
    {
        BridgeStateStore.MarkError(request, ex.Message);
        response = Result.Error(request, ex.Message);
    }

    await NativeMessaging.WriteAsync(Console.OpenStandardOutput(), response);
}

static class Dispatcher
{
    public static async Task<JsonObject> HandleAsync(JsonObject req)
    {
        var tool = req["tool"]?.GetValue<string>() ?? throw new InvalidOperationException("Не указано поле tool");
        return tool switch
        {
            "bridge.describe" => Describe(req),
            "dashboard.open" => DashboardHost.Open(req),
            "dashboard.status" => DashboardHost.Status(req),
            "workspace.list" => WorkspaceStore.List(req),
            "workspace.add" => WorkspaceStore.Add(req),
            "workspace.remove" => WorkspaceStore.Remove(req),
            "workspace.tree" => WorkspaceStore.Tree(req),
            "workspace.find" => WorkspaceStore.Find(req),
            "workspace.transaction" => await WorkspaceTransactionTool.ApplyAsync(req),
            "history.list" => OperationHistory.List(req),
            "history.rollback" => OperationHistory.Rollback(req),
            "history.rollback.transaction" => OperationHistory.RollbackTransaction(req),
            "history.rollback.transaction.undo" => OperationHistory.UndoTransactionRollback(req),
            "file.patch.batch" => BatchPatchTool.Apply(req),
            "file.read" => ReadFile(req),
            "file.read.batch" => BatchReadTool.Read(req),
            "file.read.batch.tree" => BatchTreeReadTool.Read(req),
            "file.write" => WriteFile(req),
            "file.patch" => ApplyPatch(req),
            "file.exists" => Exists(req),
            "file.list" => List(req),
            "directory.create" => CreateDirectory(req),
            "everything.search" => await EverythingSearch(req),
            "process.run" => await RunProcess(req),
            _ => Result.Error(req, $"Неизвестный инструмент: {tool}")
        };
    }

    static JsonObject Describe(JsonObject req)
    {
        var es = ToolResolver.Resolve("es.exe");
        return Result.Ok(req, new JsonObject {
            ["host_version"] = "0.18.5",
            ["capabilities"] = new JsonArray("bridge.describe","dashboard.open","dashboard.status","workspace.list","workspace.add","workspace.remove","workspace.tree","workspace.find","workspace.transaction","history.list","history.rollback","history.rollback.transaction","history.rollback.transaction.undo","file.read","file.read.batch","file.read.batch.tree","file.write","file.patch","file.patch.batch","file.exists","file.list","directory.create","everything.search","process.run"),
            ["tools"] = new JsonObject { ["es"] = es },
            ["workspaces"] = WorkspaceStore.DescribeWorkspaces()
        });
    }

    static JsonObject ReadFile(JsonObject req)
    {
        var path = Paths.Full(req, "path");
        var max = req["max_chars"]?.GetValue<int>() ?? 200000;
        var text = File.ReadAllText(path, Encoding.UTF8);
        var truncated = text.Length > max;
        if (truncated) text = text[..max];
        return Result.Ok(req, new JsonObject { ["path"]=path,["sha256"]=Hash(path),["content"]=text,["truncated"]=truncated });
    }

    static JsonObject WriteFile(JsonObject req)
    {
        var path = Paths.Full(req, "path");
        Confirm($"Заменить файл?\n\n{path}");
        CheckExpectedHash(req, path);
        var beforeSha256 = File.Exists(path) ? Hash(path) : null;
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        string? backup = null;
        if (File.Exists(path)) { backup = path + ".cbb-backup-" + DateTime.Now.ToString("yyyyMMdd-HHmmss"); File.Copy(path, backup, true); }
        var tmp = path + ".cbb-tmp-" + Guid.NewGuid().ToString("N");
        File.WriteAllText(tmp, req["content"]?.GetValue<string>() ?? "", new UTF8Encoding(false));
        File.Move(tmp, path, true);
        var afterSha256 = Hash(path);
        OperationHistory.RecordFileChange(req, path, backup, beforeSha256, afterSha256);
        return Result.Ok(req, new JsonObject { ["path"]=path,["backup_path"]=backup,["sha256"]=afterSha256 });
    }

    static JsonObject ApplyPatch(JsonObject req)
    {
        var path = Paths.Full(req, "path");
        CheckExpectedHash(req, path);
        var beforeSha256 = Hash(path);
        var oldText = File.ReadAllText(path, Encoding.UTF8).Replace("\r\n","\n");
        var patch = req["patch"]?.GetValue<string>() ?? throw new InvalidOperationException("Не указано поле patch");
        var newText = UnifiedPatch.Apply(oldText, patch);
        PatchPreviewDialog.Confirm(path, patch, oldText, newText);
        var backup = path + ".cbb-backup-" + DateTime.Now.ToString("yyyyMMdd-HHmmss");
        File.Copy(path, backup, true);
        File.WriteAllText(path, newText.Replace("\n", Environment.NewLine), new UTF8Encoding(false));
        var afterSha256 = Hash(path);
        OperationHistory.RecordFileChange(req, path, backup, beforeSha256, afterSha256);
        return Result.Ok(req, new JsonObject { ["path"]=path,["backup_path"]=backup,["sha256"]=afterSha256 });
    }

    static JsonObject Exists(JsonObject req)
    {
        var path = Paths.Full(req, "path");
        return Result.Ok(req, new JsonObject { ["path"]=path,["file"]=File.Exists(path),["directory"]=Directory.Exists(path) });
    }

    static JsonObject List(JsonObject req)
    {
        var path = Paths.Full(req, "path");
        var limit = req["limit"]?.GetValue<int>() ?? 200;
        var arr = new JsonArray();
        foreach (var entry in Directory.EnumerateFileSystemEntries(path).Take(limit))
            arr.Add(new JsonObject { ["name"]=Path.GetFileName(entry),["path"]=entry,["type"]=Directory.Exists(entry)?"directory":"file" });
        return Result.Ok(req, new JsonObject { ["path"]=path,["entries"]=arr });
    }

    static JsonObject CreateDirectory(JsonObject req)
    {
        var path = Paths.Full(req, "path");
        Confirm($"Создать папку?\n\n{path}");
        Directory.CreateDirectory(path);
        return Result.Ok(req, new JsonObject { ["path"]=path });
    }

    static async Task<JsonObject> EverythingSearch(JsonObject req)
    {
        return await EverythingTool.SearchAsync(req);
    }

    static async Task<JsonObject> RunProcess(JsonObject req)
    {
        var exeRaw = req["executable"]?.GetValue<string>() ?? throw new InvalidOperationException("Не указано executable");
        var exe = ToolResolver.Resolve(exeRaw) ?? exeRaw;
        var args = req["args"] is JsonArray a ? a.Select(x => x?.GetValue<string>() ?? "").ToArray() : [];
        var cwdRaw = req["cwd"]?.GetValue<string>();
        var cwd = string.IsNullOrWhiteSpace(cwdRaw)
            ? null
            : WorkspaceStore.ResolveOptionalPath(req, "cwd");
        var timeout = req["timeout_seconds"]?.GetValue<int>() ?? 120;
        Confirm($"Запустить программу?\n\n{exe}\n{string.Join(" ", args)}\n\nРабочая папка: {cwd ?? "по умолчанию"}");
        return await ProcessRunner.Run(req, exe, args, cwd, timeout);
    }

    static void CheckExpectedHash(JsonObject req, string path)
    {
        var expected = req["expected_sha256"]?.GetValue<string>();
        if (!string.IsNullOrWhiteSpace(expected) && File.Exists(path) && !Hash(path).Equals(expected, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("SHA-256 исходного файла не совпадает. Файл был изменён после чтения.");
    }

    static string Hash(string path) => Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(path))).ToLowerInvariant();
    static void Confirm(string text)
    {
        var result = System.Windows.Forms.MessageBox.Show(text, "ChatGPT Browser Bridge", System.Windows.Forms.MessageBoxButtons.OKCancel, System.Windows.Forms.MessageBoxIcon.Warning);
        if (result != System.Windows.Forms.DialogResult.OK) throw new OperationCanceledException("Операция отменена пользователем");
    }

    public static void ConfirmOperation(string text)
    {
        Confirm(text);
    }
}
