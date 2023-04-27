#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%
global versLocal
global VersOnline
FileVers = %A_Scriptdir%\vers
FileSettings = %A_Scriptdir%\settings.ini
UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/autoroll/version.htm, %FileVers%
IniRead, VersOnline, %FileSettings%, others, vers
FileRead, versLocal, %FileVers%
FileDelete, %FileVers%
if(%versLocal%<%VersOnline% or %versLocal%=="")
    {
        MsgBox, %VersOnline% || %versLocal%
    }

    MsgBox, exit
    Exit
