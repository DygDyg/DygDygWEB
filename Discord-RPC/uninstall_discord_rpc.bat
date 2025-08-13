@echo off
chcp 1251 >nul
set "appdata_dir=%APPDATA%\DiscordRPC"
set "destination_file=%appdata_dir%\discord-rpc-server.exe"
set "service_name=DiscordRPCService"
set "protocol_name=rtc"
set "protocol_reg_key=HKCR\%protocol_name%"

:: �������� ������������� ������ � � ���������
sc query "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ������������� ������ %service_name%...
    net stop "%service_name%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo ������ ������� �����������
    ) else (
        echo ��������������: �� ������� ���������� ������
    )
)

:: �������� ������
sc delete "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ������ %service_name% ������� �������
) else (
    echo ��������������: ������ %service_name% �� ������� ��� �� �������
)

:: �������� ��������� rtc://
reg delete "%protocol_reg_key%" /f >nul 2>&1
if %ERRORLEVEL%==0 (
    echo �������� rtc:// ������� �����
) else (
    echo ��������������: �������� rtc:// �� ������ ��� �� �����
)

:: �������������� ���������� �������� discord-rpc-server.exe
taskkill /IM discord-rpc-server.exe /F >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ������� discord-rpc-server.exe ������� ��������
) else (
    echo ��������������: ������� discord-rpc-server.exe �� ������ ��� �� ��������
)

:: �������� �����
if exist "%destination_file%" (
    del /F /Q "%destination_file%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo ���� %destination_file% ������� �����
    ) else (
        echo ������: �� ������� ������� ���� %destination_file%. ��������, ���� ������������ ��� ����������� �����
        echo ���������� ������� ��� ��������� �������� � ��������� ������ �� ����� ��������������
        exit /b 1
    )
)

:: �������� �����
if exist "%appdata_dir%" (
    rmdir /S /Q "%appdata_dir%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo ����� %appdata_dir% ������� �������
    ) else (
        echo ������: �� ������� ������� ����� %appdata_dir%. ��������� ����� �������
        exit /b 1
    )
)

echo ������������� ���������!
pause