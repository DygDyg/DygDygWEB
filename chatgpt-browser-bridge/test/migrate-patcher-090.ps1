$ErrorActionPreference = 'Stop'

$root = 'E:\chrome_tool\chatgpt-browser-bridge'
$programPath = Join-Path $root 'bridge-host\Program.cs'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$program = [System.IO.File]::ReadAllText(
    $programPath,
    [System.Text.Encoding]::UTF8
)

$backup = $programPath + '.cbb-backup-patcher-' + $stamp
[System.IO.File]::Copy($programPath, $backup, $true)

$startMarker = 'static class UnifiedPatch'
$endMarker = 'static class Paths'
$startIndex = $program.IndexOf($startMarker)
$endIndex = $program.IndexOf($endMarker)

if ($startIndex -lt 0) {
    throw 'UnifiedPatch class was not found in Program.cs'
}

if ($endIndex -lt 0 -or $endIndex -le $startIndex) {
    throw 'Paths class marker was not found after UnifiedPatch'
}

$before = $program.Substring(0, $startIndex)
$after = $program.Substring($endIndex)
$program = $before + $after
$program = $program.Replace(
    '["host_version"] = "0.8.0"',
    '["host_version"] = "0.9.0"'
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
    removed_class = 'UnifiedPatch'
    host_version = '0.9.0'
} | ConvertTo-Json -Depth 4
