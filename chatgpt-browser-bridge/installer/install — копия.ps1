$ErrorActionPreference = 'Stop'

$hostName = 'com.chatgpt_browser_bridge.host'
$extensionId = 'nookckfjmffkgdbjoiafiponhdmalkdn'
$root = Split-Path -Parent $PSScriptRoot
$hostProject = Join-Path $root 'bridge-host\BridgeHost.csproj'
$dashboardProject = Join-Path $root 'dashboard-host\BridgeDashboard.csproj'
$installDir = Join-Path $env:LOCALAPPDATA 'ChatGPTBrowserBridge\NativeHost'
$tempRoot = Join-Path $env:TEMP ('CBB-Publish-' + [Guid]::NewGuid().ToString('N'))
$hostPublish = Join-Path $tempRoot 'host'
$dashboardPublish = Join-Path $tempRoot 'dashboard'

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw 'dotnet was not found. Install .NET 8 SDK or newer.'
}

Write-Host 'Stopping old Bridge processes...' -ForegroundColor Cyan
Get-Process -Name 'BridgeHost' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name 'BridgeDashboard' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

Write-Host 'Publishing BridgeHost...' -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $hostPublish | Out-Null
New-Item -ItemType Directory -Force -Path $dashboardPublish | Out-Null

try {
    & dotnet publish $hostProject `
        -c Release `
        -r win-x64 `
        --self-contained true `
        -p:PublishSingleFile=true `
        -o $hostPublish

    if ($LASTEXITCODE -ne 0) {
        throw "BridgeHost publish failed with exit code $LASTEXITCODE"
    }

    Write-Host 'Publishing BridgeDashboard...' -ForegroundColor Cyan

    & dotnet publish $dashboardProject `
        -c Release `
        -r win-x64 `
        --self-contained true `
        -p:PublishSingleFile=true `
        -o $dashboardPublish

    if ($LASTEXITCODE -ne 0) {
        throw "BridgeDashboard publish failed with exit code $LASTEXITCODE"
    }

    $builtHostExe = Join-Path $hostPublish 'BridgeHost.exe'
    $builtDashboardExe = Join-Path $dashboardPublish 'BridgeDashboard.exe'

    if (-not (Test-Path -LiteralPath $builtHostExe -PathType Leaf)) {
        throw "Published executable was not created: $builtHostExe"
    }

    if (-not (Test-Path -LiteralPath $builtDashboardExe -PathType Leaf)) {
        throw "Published executable was not created: $builtDashboardExe"
    }

    New-Item -ItemType Directory -Force -Path $installDir | Out-Null

    $exe = Join-Path $installDir 'BridgeHost.exe'
    $dashboardExe = Join-Path $installDir 'BridgeDashboard.exe'
    $backup = $null
    $dashboardBackup = $null

    if (Test-Path -LiteralPath $exe -PathType Leaf) {
        $backup = $exe + '.backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
        Copy-Item -LiteralPath $exe -Destination $backup -Force
    }

    if (Test-Path -LiteralPath $dashboardExe -PathType Leaf) {
        $dashboardBackup = $dashboardExe + '.backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
        Copy-Item -LiteralPath $dashboardExe -Destination $dashboardBackup -Force
    }

    Copy-Item -LiteralPath $builtHostExe -Destination $exe -Force
    Copy-Item -LiteralPath $builtDashboardExe -Destination $dashboardExe -Force

    if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
        throw "Failed to install executable: $exe"
    }

    if (-not (Test-Path -LiteralPath $dashboardExe -PathType Leaf)) {
        throw "Failed to install executable: $dashboardExe"
    }

    $manifestPath = Join-Path $installDir ($hostName + '.json')
    $manifest = [ordered]@{
        name = $hostName
        description = 'ChatGPT Browser Bridge local host'
        path = $exe
        type = 'stdio'
        allowed_origins = @("chrome-extension://$extensionId/")
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText(
        $manifestPath,
        ($manifest | ConvertTo-Json -Depth 4),
        $utf8NoBom
    )

    $regPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName"
    New-Item -Force -Path $regPath | Out-Null
    Set-Item -Path $regPath -Value $manifestPath

    Write-Host ''
    Write-Host "Installed: $exe" -ForegroundColor Green
    Write-Host "Installed: $dashboardExe" -ForegroundColor Green
    Write-Host "Manifest: $manifestPath" -ForegroundColor Green
    if ($backup) {
        Write-Host "Host backup: $backup"
    }
    if ($dashboardBackup) {
        Write-Host "Dashboard backup: $dashboardBackup"
    }
    Write-Host 'es.exe may be placed next to BridgeHost.exe or available through PATH.'
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
