@echo off
chcp 1251 >nul
set "appdata_dir=%APPDATA%\DiscordRPC"
set "destination_file=%appdata_dir%\discord-rpc-server.exe"
set "service_name=DiscordRPCService"
set "protocol_name=rtc"
set "protocol_reg_key=HKCR\%protocol_name%"

:: Проверка существования службы и её остановка
sc query "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Останавливаем службу %service_name%...
    net stop "%service_name%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo Служба успешно остановлена
    ) else (
        echo Предупреждение: не удалось остановить службу
    )
)

:: Удаление службы
sc delete "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Служба %service_name% успешно удалена
) else (
    echo Предупреждение: служба %service_name% не найдена или не удалена
)

:: Удаление протокола rtc://
reg delete "%protocol_reg_key%" /f >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Протокол rtc:// успешно удалён
) else (
    echo Предупреждение: протокол rtc:// не найден или не удалён
)

:: Принудительное завершение процесса discord-rpc-server.exe
taskkill /IM discord-rpc-server.exe /F >nul 2>&1
if %ERRORLEVEL%==0 (
    echo Процесс discord-rpc-server.exe успешно завершён
) else (
    echo Предупреждение: процесс discord-rpc-server.exe не найден или не завершён
)

:: Удаление файла
if exist "%destination_file%" (
    del /F /Q "%destination_file%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo Файл %destination_file% успешно удалён
    ) else (
        echo Ошибка: не удалось удалить файл %destination_file%. Возможно, файл используется или отсутствуют права
        echo Попробуйте закрыть все связанные процессы и запустить скрипт от имени администратора
        exit /b 1
    )
)

:: Удаление папки
if exist "%appdata_dir%" (
    rmdir /S /Q "%appdata_dir%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo Папка %appdata_dir% успешно удалена
    ) else (
        echo Ошибка: не удалось удалить папку %appdata_dir%. Проверьте права доступа
        exit /b 1
    )
)

echo Деинсталляция завершена!
pause