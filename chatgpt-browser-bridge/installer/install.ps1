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

function Update-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = @($machinePath, $userPath) -join ';'
}

function Test-DotNet8Sdk {
    if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
        return $false
    }

    try {
        $installedSdks = @(& dotnet --list-sdks 2>$null)
        return [bool]($installedSdks | Where-Object { $_ -match '^8\.' })
    }
    catch {
        return $false
    }
}

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator
    )
}

# Проверка именно .NET 8 SDK и установка при необходимости
if (-not (Test-DotNet8Sdk)) {
    $installerExe = Join-Path $PSScriptRoot 'dotnet-sdk-8.0.423-win-x64.exe'

    if (Test-Path -LiteralPath $installerExe -PathType Leaf) {
        if (-not (Test-IsAdministrator)) {
            Write-Host '.NET 8 SDK is not installed. Requesting administrator privileges...' -ForegroundColor Yellow

            $argumentList = @(
                '-NoProfile',
                '-ExecutionPolicy',
                'Bypass',
                '-File',
                ('"{0}"' -f $PSCommandPath)
            )

            $elevatedProcess = Start-Process `
                -FilePath 'powershell.exe' `
                -ArgumentList $argumentList `
                -Verb RunAs `
                -Wait `
                -PassThru

            if ($elevatedProcess.ExitCode -ne 0) {
                throw "Elevated installer failed with exit code $($elevatedProcess.ExitCode)"
            }

            exit 0
        }

        Write-Host '.NET 8 SDK not found. Installing dotnet-sdk-8.0.423-win-x64.exe...' -ForegroundColor Yellow
        & $installerExe /quiet /norestart

        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 3010) {
            throw ".NET SDK installation failed with exit code $LASTEXITCODE"
        }

        Write-Host '.NET 8 SDK installation completed.' -ForegroundColor Green
        Update-ProcessPath

        if (-not (Test-DotNet8Sdk)) {
            throw '.NET 8 SDK was installed but SDK 8.x is still unavailable. Restart Windows and run install.ps1 again.'
        }
    } else {
        throw '.NET 8 SDK was not found. Place dotnet-sdk-8.0.423-win-x64.exe next to install.ps1 or install .NET 8 SDK manually.'
    }
} else {
    $dotnetPath = (Get-Command dotnet -ErrorAction Stop).Source
    $dotnet8Sdk = @(& dotnet --list-sdks) |
        Where-Object { $_ -match '^8\.' } |
        Select-Object -Last 1

    Write-Host ".NET 8 SDK found: $dotnet8Sdk" -ForegroundColor Green
    Write-Host "dotnet: $dotnetPath" -ForegroundColor DarkGreen
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
    $sourceEsExe = Join-Path $PSScriptRoot 'es.exe'
    $destinationEsExe = Join-Path $installDir 'es.exe'
    $sourceEsIni = Join-Path $PSScriptRoot 'es.ini'
    $destinationEsIni = Join-Path $installDir 'es.ini'
    $backup = $null
    $dashboardBackup = $null

    if (-not (Test-Path -LiteralPath $sourceEsExe -PathType Leaf)) {
        throw "Required Everything command-line client was not found: $sourceEsExe"
    }

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
    Copy-Item -LiteralPath $sourceEsExe -Destination $destinationEsExe -Force

    if (Test-Path -LiteralPath $sourceEsIni -PathType Leaf) {
        Copy-Item -LiteralPath $sourceEsIni -Destination $destinationEsIni -Force
    }

    if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
        throw "Failed to install executable: $exe"
    }

    if (-not (Test-Path -LiteralPath $dashboardExe -PathType Leaf)) {
        throw "Failed to install executable: $dashboardExe"
    }

    if (-not (Test-Path -LiteralPath $destinationEsExe -PathType Leaf)) {
        throw "Failed to install Everything command-line client: $destinationEsExe"
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
    Write-Host "Installed: $destinationEsExe" -ForegroundColor Green
    if (Test-Path -LiteralPath $destinationEsIni -PathType Leaf) {
        Write-Host "Installed: $destinationEsIni" -ForegroundColor Green
    }
    Write-Host "Manifest: $manifestPath" -ForegroundColor Green
    if ($backup) {
        Write-Host "Host backup: $backup"
    }
    if ($dashboardBackup) {
        Write-Host "Dashboard backup: $dashboardBackup"
    }

    $everythingProcess = Get-Process -Name 'Everything' -ErrorAction SilentlyContinue
    $everythingService = Get-Service -Name 'Everything' -ErrorAction SilentlyContinue

    if (-not $everythingProcess -and
        (-not $everythingService -or $everythingService.Status -ne 'Running')) {
        Write-Warning 'es.exe is installed, but Everything does not appear to be running. Start Everything or its service before using everything.search.'
    }
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
