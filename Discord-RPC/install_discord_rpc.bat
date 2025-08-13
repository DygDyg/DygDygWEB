@echo off
chcp 1251 >nul
set "source_file=discord-rpc-server.exe"
set "appdata_dir=%APPDATA%\DiscordRPC"
set "destination_file=%appdata_dir%\discord-rpc-server.exe"
set "service_name=DiscordRPCService"
set "protocol_name=rtc"
set "protocol_reg_key=HKCR\%protocol_name%"

:: Принудительное завершение процесса discord-rpc-server.exe
taskkill /IM discord-rpc-server.exe /F >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Процесс discord-rpc-server.exe успешно завершён
) else (
    @REM echo Предупреждение: процесс discord-rpc-server.exe не найден или не завершён
)

:: Проверка существования службы и её остановка
sc query "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Останавливаем существующую службу %service_name%...
    net stop "%service_name%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo Служба успешно остановлена
    ) else (
        echo Предупреждение: не удалось остановить службу
    )
)

:: Удаление службы, если она существует
sc delete "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Служба %service_name% успешно удалена
) else (
    @REM echo Предупреждение: служба %service_name% не найдена или не удалена
)

:: Создание директории в AppData, если она не существует
if not exist "%appdata_dir%" (
    mkdir "%appdata_dir%"
)

:: Копирование файла в AppData
copy "%source_file%" "%destination_file%"

:: Проверка успешности копирования
if exist "%destination_file%" (
    echo Файл успешно скопирован в %appdata_dir%
) else (
    echo Ошибка: не удалось скопировать файл. Проверьте наличие %source_file%
    exit /b 1
)

:: Создание службы с автоматическим запуском
sc create "%service_name%" binPath= "%destination_file%" DisplayName= "Discord RPC Service" start= auto

:: Проверка успешности создания службы
if %ERRORLEVEL%==0 (
    echo Служба %service_name% успешно создана с автоматическим запуском
) else (
    echo Ошибка: не удалось создать службу
    exit /b 1
)

:: Запуск службы
net start "%service_name%"

:: Проверка успешности запуска службы
if %ERRORLEVEL%==0 (
    echo Служба %service_name% успешно запущена
) else (
    echo Ошибка: не удалось запустить службу
    exit /b 1
)

:: Регистрация протокола rtc://
reg add "%protocol_reg_key%" /v "" /t REG_SZ /d "URL:RTC Protocol" /f
reg add "%protocol_reg_key%" /v "URL Protocol" /t REG_SZ /d "" /f
reg add "%protocol_reg_key%\shell\open\command" /v "" /t REG_SZ /d "\"%destination_file%\" \"%%1\"" /f

:: Проверка успешности регистрации протокола
if %ERRORLEVEL%==0 (
    echo