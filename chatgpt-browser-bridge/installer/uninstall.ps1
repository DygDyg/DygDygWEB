$hostName='com.chatgpt_browser_bridge.host'
Remove-Item "HKCU:\Software\Google\Chrome\NativeMessagingHosts\$hostName" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host 'Регистрация Native Messaging Host удалена.' -ForegroundColor Green
