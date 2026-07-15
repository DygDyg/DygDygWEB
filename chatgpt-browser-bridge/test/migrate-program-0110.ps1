$ErrorActionPreference = 'Stop'

$root = 'E:\chrome_tool\chatgpt-browser-bridge'
$programPath = Join-Path $root 'bridge-host\Program.cs'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$program = [System.IO.File]::ReadAllText(
    $programPath,
    [System.Text.Encoding]::UTF8
)

$backup = $programPath + '.cbb-backup-0110-' + $stamp
[System.IO.File]::Copy($programPath, $backup, $true)

$oldEverything = @'
    static async Task<JsonObject> EverythingSearch(JsonObject req)
    {
        var es = ToolResolver.Resolve("es.exe") ?? throw new FileNotFoundException("es.exe не найден рядом с BridgeHost.exe и в PATH");
        var query = req["query"]?.GetValue<string>() ?? "";
        var limit = req["limit"]?.GetValue<int>() ?? 100;
        return await ProcessRunner.Run(req, es, ["-n", limit.ToString(), query], null, 30);
    }
'@

$newEverything = @'
    static Task<JsonObject> EverythingSearch(JsonObject req)
    {
        return EverythingTool.SearchAsync(req);
    }
'@

if (-not $program.Contains($oldEverything)) {
    throw 'EverythingSearch method was not found'
}

$program = $program.Replace($oldEverything, $newEverything)

$oldCwd = '        var cwd = req["cwd"]?.GetValue<string>();'
$newCwd = @'
        var cwdRaw = req["cwd"]?.GetValue<string>();
        var cwd = string.IsNullOrWhiteSpace(cwdRaw)
            ? null
            : WorkspaceStore.ResolveOptionalPath(req, "cwd");
'@

if (-not $program.Contains($oldCwd)) {
    throw 'cwd declaration was not found'
}

$program = $program.Replace($oldCwd, $newCwd.TrimEnd())
$program = $program.Replace(
    '["host_version"] = "0.10.0"',
    '["host_version"] = "0.11.0"'
)

[System.IO.File]::WriteAllText(
    $programPath,
    $program,
    $utf8NoBom
)

[ordered]@{
    status = 'ok'
    program_path = $programPath
    backup_path = $backup
    host_version = '0.11.0'
    changes = @(
        'structured everything.search',
        'workspace-aware process.run cwd'
    )
} | ConvertTo-Json -Depth 5
