#SingleInstance, Force
SendMode Event
SetWorkingDir, %A_ScriptDir%
;������ ���������
global vers = 9

global names := []
global x_save
global y_save
global x_save2
global y_save2
global x
global y
global x_scroll
global y_scroll
global x_scroll2
global y_scroll2
global x_ok
global y_ok
global x_roll
global y_roll
global delays
global tmp := []
global pars_patern = ","


SetdefaultMouseSpeed, 2
File = %A_Scriptdir%\base.txt
FileRead, str, %File%
names := StrSplit(str, pars_patern)
if(!names.MaxIndex()){
    UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/PoE/autoroll/base.txt, %A_Scriptdir%\base.txt
    MsgBox, "���� ���������"
    config_start()
    FileRead, str, %File%
    names := StrSplit(str, pars_patern)
}

load()
{
    File = %A_Scriptdir%\settings.ini
    ;���������� ������� ������
    IniWrite, %vers%, %File%, others, vers
    ; IniRead, OutputVar, %File%, section2, key

    ;��������� �������
    IniRead, x_save, %File%, start position, x
    IniRead, y_save, %File%, start position, y

    If (x_save=="ERROR" or x_save==""){
        x_save = 337
        y_save = 279
        save()
    }

    ;�������� �������
    IniRead, x_save2, %File%, end position, x
    IniRead, y_save2, %File%, end position, y

    If (x_save2=="ERROR" or x_save2==""){
        x_save2 = 53
        y_save2 = 53
        save()
    }

    ;��������� �������� ������
    IniRead, x_scroll, %File%, scroll position start, x
    IniRead, y_scroll, %File%, scroll position start, y
    If (x_scroll=="ERROR" or x_scroll==""){
        x_scroll = 73
        y_scroll = 80
        save()
    }

    ;��������� ���� �������
    IniRead, x_scroll2, %File%, scroll position end, x
    IniRead, y_scroll2, %File%, scroll position end, y

    If (x_scroll2=="ERROR" or x_scroll2==""){
        x_scroll2 = 659
        y_scroll2 = 798
        save()
    }

    ;��������� ������ �������
    IniRead, x_ok, %File%, ok position, x
    IniRead, y_ok, %File%, ok position, y

    If (x_ok=="ERROR" or x_ok==""){
        x_ok = 618
        y_ok = 866
        save()
    }

    ;��������� ������ ����
    IniRead, x_roll, %File%, roll position, x
    IniRead, y_roll, %File%, roll position, y

    If (x_roll=="ERROR" or x_roll==""){
        x_roll = 954
        y_roll = 844
        save()
    }

    ;�������������� ��������
    IniRead, delays, %File%, others, delays

    If (delays=="ERROR" or delays==""){
        delays = 50
        save()
    }
}
load()

save()
{
    File = %A_Scriptdir%\settings.ini

    ;��������� �������
    IniWrite, %x_save%, %File%, start position, x
    IniWrite, %y_save%, %File%, start position, y

    ;������ ������, ��� �������� ������ � ������
    IniWrite, %x_save2%, %File%, end position, x
    IniWrite, %y_save2%, %File%, end position, y

    ;��������� �������� ������
    IniWrite, %x_scroll%, %File%, scroll position start, x
    IniWrite, %y_scroll%, %File%, scroll position start, y

    ;��������� ���� �������
    IniWrite, %x_scroll2%, %File%, scroll position end, x
    IniWrite, %y_scroll2%, %File%, scroll position end, y

    ;��������� ������ �������
    IniWrite, %x_ok%, %File%, ok position, x
    IniWrite, %y_ok%, %File%, ok position, y

    ;��������� ������ ����
    IniWrite, %x_roll%, %File%, roll position, x
    IniWrite, %y_roll%, %File%, roll position, y

    ;�������������� ��������
    IniWrite, %delays%, %File%, others, delays
    ; IniRead, delays, %File%, others, delays
}

scan(){
    File = %A_Scriptdir%\base.txt
    logs := A_Scriptdir "\logs.txt"
    FileRead, str, %File%
    names := StrSplit(str, pars_patern)

    Send, {Ctrl down}
    Send {c}
    Sleep, %delays%
    Send, {Ctrl up}
    Sleep, %delays%

    datsss := StrSplit(clipboard, "`n").3
    FileAppend %datsss%, %logs%

    Loop % names.MaxIndex(){
        rer := RegExMatch(Format("{:L}", `clipboard`), Format("{:L}", names[A_Index]))
        If (rer>0){
            Sleep, 100
            ; save()
            Send, {LButton}
            Sleep, 100
            trade()
            Sleep, 100
            FileAppend <<<>>>`n, %logs%
        }
    }
    clipboard :=
}

trade(){
    Random, r1, -5, 5
    Random, r2, -5, 5
    MouseMove, x_scroll+r1, y_scroll+r2
    Sleep, %delays%
    Sleep, %delays%
    Send, {LButton down}
    Random, r1, -5, 5
    Random, r2, -5, 5
    MouseMove, x_scroll2+r1, y_scroll2+r2
    Sleep, %delays%
    Sleep, %delays%
    Send, {LButton up}

    Random, r1, -5, 5
    Random, r2, -5, 5
    MouseMove, x_ok+r1, y_ok+r2

    Sleep, %delays%
    Send, {LButton}
    sleep, 300
    Send, {LButton}

    Return

}

Start_scan()
{
    logs := A_Scriptdir "\logs.txt"
    FileDelete, %logs%
    x := x_save
    y := y_save
    Random, r1, -5, 5
    Random, r2, -5, 5
    MouseMove, x+r1, y+r2
    Sleep, 20
    Loop, 2
    {
        Loop, 11
        {
            Random, r1, -5, 5
            Random, r2, -5, 5
            MouseMove, x+r1, y+r2
            Sleep, 30
            y := y + y_save2
            FileAppend -----------`n, %logs%
            scan()
        }
        y := y_save
        x := x + y_save2
    }
    Random, r1, -5, 5
    Random, r2, -5, 5
    MouseMove, x_roll+r1, y_roll+r2
}

config_start()
{
    Gui, +AlwaysOnTop +Resize
    Gui, Add, Text, , ��� �������� ����� ���� �������� ����� Alt+ F9
    Gui, Add, Text, , ������ �� ������ � ��������� �� ���� � ������� 5 ������
    Gui, Add, Text, , �� ������ �������� � ���� ����, ���� ����� ��������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , ������ ���� � ��������: %x_save%�%y_save%
    Gui, Add, Button, gGetSave, ���������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , ��������� ����: %x_save2%�%y_save2%
    Gui, Add, Button, gGetSave2, ���������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , ���������� ��������� ������ ���������: %x_scroll%�%y_scroll%
    Gui, Add, Button, gGetScroll, ���������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , ���� ����������� ������: %x_scroll2%�%y_scroll2%
    Gui, Add, Button, gGetScroll2, ���������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , ������ �����������: %x_ok%�%y_ok%
    Gui, Add, Button, gOk, ���������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , ������ ����: %x_roll%�%y_roll%
    Gui, Add, Button, gRoll, ���������
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , "ScrollLock" - ���������
    Gui, Add, Text, , "CapsLock" - ����������

    Gui, Show, NoActivate, ���������. ������: %vers%
    return

    GetSave:
        Gui, Destroy
        WinActivate, ahk_exe PathOfExileSteam.exe
        Sleep, 5000
        WinActivate, ahk_exe PathOfExileSteam.exe
        MouseGetPos, x_save, y_save
        config_start()
        save()
    Return

    GetSave2:
        Gui, Destroy
        WinActivate, ahk_exe PathOfExileSteam.exe
        Sleep, 5000
        WinActivate, ahk_exe PathOfExileSteam.exe
        MouseGetPos, xxx, yyy
        a := (yyy-y_save)/10
        y_save2 := a
        x_save2 := a
        config_start()
        save()
    Return

    GetScroll:
        Gui, Destroy
        WinActivate, ahk_exe PathOfExileSteam.exe
        Sleep, 5000
        WinActivate, ahk_exe PathOfExileSteam.exe
        MouseGetPos, x_scroll, y_scroll
        config_start()
        save()
    Return

    GetScroll2:
        Gui, Destroy
        WinActivate, ahk_exe PathOfExileSteam.exe
        Sleep, 5000
        WinActivate, ahk_exe PathOfExileSteam.exe
        MouseGetPos, x_scroll2, y_scroll2
        config_start()
        save()
    Return

    Ok:
        Gui, Destroy
        WinActivate, ahk_exe PathOfExileSteam.exe
        Sleep, 5000
        WinActivate, ahk_exe PathOfExileSteam.exe
        MouseGetPos, x_ok, y_ok
        config_start()
        save()
    Return

    Roll:
        Gui, Destroy
        WinActivate, ahk_exe PathOfExileSteam.exe
        Sleep, 5000
        WinActivate, ahk_exe PathOfExileSteam.exe
        MouseGetPos, x_roll, y_roll
        config_start()
        save()
    Return
}

F3::
    {
        x_inv = 1344
        y_inv = 599
        x := x_inv
        y := y_inv
        Send, {Ctrl down}
        loop, 12{
            Loop, 5
            {
                Random, r1, -5, 5
                Random, r2, -5, 5
                MouseMove, x+r1, y+r2
                ; MouseClick, left, x, y
                ;
                y := y + y_save2
                Sleep, 20+r1
                Send, {LButton}
                Sleep, 20
            }
            y := y_inv
            x := x + y_save2
        }
        Send, {Ctrl up}
        Return
    }

; F5::
; {
; Return
; }

F9::
    {
        Start_roll:
            Start_scan()
            if(GetKeyState("CapsLock", "T")==1){
                Start_scan()
            }

            if(GetKeyState("ScrollLock", "T")==1){
                Random, r1, -5, 5
                Random, r2, -5, 5
                MouseMove, x_roll + r1, y_roll + r2
                Sleep, 50
                Send, {LButton}
                Sleep, 1000
                Goto, Start_roll

            }
        return
    }

    ^F9::
        {
            config_start()
            Return
        }

    F7::
        {
            WinActivate, ahk_exe PathOfExileSteam.exe
            MouseGetPos, xxx, yyy
            MsgBox %xxx% : %yyy%

            return
        }

