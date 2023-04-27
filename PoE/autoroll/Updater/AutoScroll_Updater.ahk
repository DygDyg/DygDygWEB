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

; MsgBox, %VersOnline% || %VersLocal%
if(VersLocal < VersOnline)
    {
        ; MsgBox, up
        FileEXE = %A_Scriptdir%\AutoRoll.exe
        UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/PoE/autoroll/AutoRoll.exe, %FileEXE%
    }
    ; MsgBox, exit
    FileDelete, %FileVers%
    Exit
