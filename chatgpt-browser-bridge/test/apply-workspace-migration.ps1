$ErrorActionPreference = 'Stop'

$root = 'E:\chrome_tool\chatgpt-browser-bridge'
$programPath = Join-Path $root 'bridge-host\Program.cs'
$contentPath = Join-Path $root 'extension\chatgpt-content.js'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$program = [System.IO.File]::ReadAllText($programPath, [System.Text.Encoding]::UTF8)
$programBackup = $programPath + '.cbb-backup-workspace-' + $stamp
[System.IO.File]::Copy($programPath, $programBackup, $true)

$pathsPattern = '(?ms)static class Paths\s*\{\s*public static string Full\(JsonObject req,string key\)\s*\{.*?\}\s*\}'
$pathsReplacement = @'
static class Paths
{
    public static string Full(JsonObject req,string key)
    {
        return WorkspaceStore.ResolvePath(req, key);
    }
}
'@

if (-not [regex]::IsMatch($program, $pathsPattern)) {
    throw 'Paths class was not found in Program.cs'
}

$program = [regex]::Replace($program, $pathsPattern, $pathsReplacement, 1)
[System.IO.File]::WriteAllText($programPath, $program, $utf8NoBom)

$content = [System.IO.File]::ReadAllText($contentPath, [System.Text.Encoding]::UTF8)
$contentBackup = $contentPath + '.cbb-backup-workspace-' + $stamp
[System.IO.File]::Copy($contentPath, $contentBackup, $true)

$oldTools = "const localTools = ['bridge.describe','file.read','file.write','file.patch','file.exists','file.list','directory.create','everything.search','process.run'];"
$newTools = "const localTools = ['bridge.describe','workspace.list','workspace.add','workspace.remove','workspace.tree','workspace.find','file.read','file.write','file.patch','file.exists','file.list','directory.create','everything.search','process.run'];"

if (-not $content.Contains($oldTools)) {
    throw 'localTools declaration was not found in chatgpt-content.js'
}

$content = $content.Replace($oldTools, $newTools)

$labelsMarker = "    const labels = {"
$labelsReplacement = @'
    const labels = {
      'workspace.list':'List workspaces',
      'workspace.add':'Add workspace',
      'workspace.remove':'Remove workspace',
      'workspace.tree':'Workspace tree',
      'workspace.find':'Find in workspace',
'@

if (-not $content.Contains($labelsMarker)) {
    throw 'labels declaration was not found in chatgpt-content.js'
}

$content = $content.Replace($labelsMarker, $labelsReplacement)
[System.IO.File]::WriteAllText($contentPath, $content, $utf8NoBom)

[ordered]@{
    status = 'ok'
    program_path = $programPath
    program_backup = $programBackup
    content_path = $contentPath
    content_backup = $contentBackup
} | ConvertTo-Json -Depth 4
