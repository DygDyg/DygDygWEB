#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%
global VersLocal
global VersOnline
FileVers = %A_Scriptdir%\vers
FileSettings = %A_Scriptdir%\settings.ini
UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/PoE/autoroll/version, %FileVers%
IniRead, VersLocal, %FileSettings%, others, vers
FileRead, VersOnline, %FileVers%


if(VersLocal < VersOnline or VersLocal == "ERROR")
    {
        FileEXE = %A_Scriptdir%\AutoRoll.exe
        UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/PoE/autoroll/autoroll.exe, %FileEXE%
        ; MsgBox, version: %VersLocal% -> %VersOnline%, Обновлена!
        MsgBox, version: %VersOnline%
    }
    ; MsgBox, exit
    FileDelete, %FileVers%
    Run, AutoRoll.exe
    Exit
