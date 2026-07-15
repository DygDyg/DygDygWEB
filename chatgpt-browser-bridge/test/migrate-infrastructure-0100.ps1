$ErrorActionPreference = 'Stop'

$root = 'E:\chrome_tool\chatgpt-browser-bridge'
$programPath = Join-Path $root 'bridge-host\Program.cs'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

$program = [System.IO.File]::ReadAllText(
    $programPath,
    [System.Text.Encoding]::UTF8
)

$backup = $programPath + '.cbb-backup-infrastructure-' + $stamp
[System.IO.File]::Copy($programPath, $backup, $true)

$marker = 'static class ProcessRunner'
$index = $program.IndexOf($marker)

if ($index -lt 0) {
    throw 'ProcessRunner marker was not found in Program.cs'
}

$program = $program.Substring(0, $index).TrimEnd() + [Environment]::NewLine
$program = $program.Replace(
    '["host_version"] = "0.9.0"',
    '["host_version"] = "0.10.0"'
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
    extracted_classes = @(
        'ProcessRunner',
        'ToolResolver',
        'Paths',
        'Result',
        'NativeMessaging'
    )
    host_version = '0.10.0'
} | ConvertTo-Json -Depth 5
