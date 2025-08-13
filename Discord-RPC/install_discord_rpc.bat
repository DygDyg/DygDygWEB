@echo off
chcp 1251 >nul
set "source_file=discord-rpc-server.exe"
set "appdata_dir=%APPDATA%\DiscordRPC"
set "destination_file=%appdata_dir%\discord-rpc-server.exe"
set "service_name=DiscordRPCService"
set "protocol_name=rtc"
set "protocol_reg_key=HKCR\%protocol_name%"

:: �������������� ���������� �������� discord-rpc-server.exe
taskkill /IM discord-rpc-server.exe /F >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ������� discord-rpc-server.exe ������� ��������
) else (
    @REM echo ��������������: ������� discord-rpc-server.exe �� ������ ��� �� ��������
)

:: �������� ������������� ������ � � ���������
sc query "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ������������� ������������ ������ %service_name%...
    net stop "%service_name%" >nul 2>&1
    if %ERRORLEVEL%==0 (
        echo ������ ������� �����������
    ) else (
        echo ��������������: �� ������� ���������� ������
    )
)

:: �������� ������, ���� ��� ����������
sc delete "%service_name%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ������ %service_name% ������� �������
) else (
    @REM echo ��������������: ������ %service_name% �� ������� ��� �� �������
)

:: �������� ���������� � AppData, ���� ��� �� ����������
if not exist "%appdata_dir%" (
    mkdir "%appdata_dir%"
)

:: ����������� ����� � AppData
copy "%source_file%" "%destination_file%"

:: �������� ���������� �����������
if exist "%destination_file%" (
    echo ���� ������� ���������� � %appdata_dir%
) else (
    echo ������: �� ������� ����������� ����. ��������� ������� %source_file%
    exit /b 1
)

:: �������� ������ � �������������� ��������
sc create "%service_name%" binPath= "%destination_file%" DisplayName= "Discord RPC Service" start= auto

:: �������� ���������� �������� ������
if %ERRORLEVEL%==0 (
    echo ������ %service_name% ������� ������� � �������������� ��������
) else (
    echo ������: �� ������� ������� ������
    exit /b 1
)

:: ������ ������
net start "%service_name%"

:: �������� ���������� ������� ������
if %ERRORLEVEL%==0 (
    echo ������ %service_name% ������� ��������
) else (
    echo ������: �� ������� ��������� ������
    exit /b 1
)

:: ����������� ��������� rtc://
reg add "%protocol_reg_key%" /v "" /t REG_SZ /d "URL:RTC Protocol" /f
reg add "%protocol_reg_key%" /v "URL Protocol" /t REG_SZ /d "" /f
reg add "%protocol_reg_key%\shell\open\command" /v "" /t REG_SZ /d "\"%destination_file%\" \"%%1\"" /f

:: �������� ���������� ����������� ���������
if %ERRORLEVEL%==0 (
    echo