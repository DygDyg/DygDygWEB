#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%
global VersLocal
global VersOnline
FileVers = %A_Scriptdir%\Online_settings.ini
FileSettings = %A_Scriptdir%\settings.ini
UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/PoE/autoroll/settings.ini, %FileVers%
IniRead, VersLocal, %FileSettings%, others, vers
IniRead, VersOnline, %FileVers%, others, vers


if(VersLocal < VersOnline or VersLocal == "ERROR")
    {
        FileEXE = %A_Scriptdir%\AutoRoll.exe
        UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/PoE/autoroll/autoroll.exe, %FileEXE%
        
        if(VersLocal == "ERROR"){
            MsgBox, version: %VersOnline%
        }else{
            MsgBox, version: %VersLocal% -> %VersOnline%, Обновлена!
        }
        
    }
    ; MsgBox, exit
    FileDelete, %FileVers%
    Run, AutoRoll.exe
    Exit
