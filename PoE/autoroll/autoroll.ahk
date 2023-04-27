#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

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

SetdefaultMouseSpeed, 100
File = %A_Scriptdir%\base.txt
FileRead, str, %File%
names := StrSplit(str, pars_patern)
if(!names.MaxIndex()){
    UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/base.txt, %A_Scriptdir%\base.txt
    MsgBox, "База загружена"
    config_start()
    FileRead, str, %File%
    names := StrSplit(str, pars_patern)
}

load()
{
    File = %A_Scriptdir%\settings.ini
    ; IniRead, OutputVar, %File%, section2, key

    ;Стартовая позиция
    IniRead, x_save, %File%, start position, x
    IniRead, y_save, %File%, start position, y

    If (x_save=="ERROR" or x_save==""){
        x_save = 337
        y_save = 279
        save()
    }

    ;конечная позиция
    IniRead, x_save2, %File%, end position, x
    IniRead, y_save2, %File%, end position, y

    If (x_save2=="ERROR" or x_save2==""){
        x_save2 = 53
        y_save2 = 53
        save()
    }

    ;Положение ползунка скрола
    IniRead, x_scroll, %File%, scroll position start, x
    IniRead, y_scroll, %File%, scroll position start, y
    If (x_scroll=="ERROR" or x_scroll==""){
        x_scroll = 73
        y_scroll = 80
        save()
    }

    ;Положение куда крутить
    IniRead, x_scroll2, %File%, scroll position end, x
    IniRead, y_scroll2, %File%, scroll position end, y

    If (x_scroll2=="ERROR" or x_scroll2==""){
        x_scroll2 = 659
        y_scroll2 = 798
        save()
    }

    ;Положение кнопки продажи
    IniRead, x_ok, %File%, ok position, x
    IniRead, y_ok, %File%, ok position, y

    If (x_ok=="ERROR" or x_ok==""){
        x_ok = 618
        y_ok = 866
        save()
    }

    ;Положение кнопки рола
    IniRead, x_roll, %File%, roll position, x
    IniRead, y_roll, %File%, roll position, y

    If (x_roll=="ERROR" or x_roll==""){
        x_roll = 954
        y_roll = 844
        save()
    }

    ;Дополнительная задержка
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

    ;Стартовая позиция
    IniWrite, %x_save%, %File%, start position, x
    IniWrite, %y_save%, %File%, start position, y

    
    ;Вторая ячейка, для подсчёта ширины и высоты
    IniWrite, %x_save2%, %File%, end position, x
    IniWrite, %y_save2%, %File%, end position, y

    ;Положение ползунка скрола
    IniWrite, %x_scroll%, %File%, scroll position start, x
    IniWrite, %y_scroll%, %File%, scroll position start, y

    ;Положение куда крутить
    IniWrite, %x_scroll2%, %File%, scroll position end, x
    IniWrite, %y_scroll2%, %File%, scroll position end, y

    ;Положение кнопки продажи
    IniWrite, %x_ok%, %File%, ok position, x
    IniWrite, %y_ok%, %File%, ok position, y

    ;Положение кнопки рола
    IniWrite, %x_roll%, %File%, roll position, x
    IniWrite, %y_roll%, %File%, roll position, y

    ;Дополнительная задержка
    IniWrite, %delays%, %File%, others, delays
    ; IniRead, delays, %File%, others, delays
}

scan(){
    File = %A_Scriptdir%\base.txt
    logs := A_Scriptdir "\logs.txt"
    FileRead, str, %File%
    names := StrSplit(str, pars_patern)
    if(!names.MaxIndex()){
        UrlDownloadToFile, https://dygdyg.github.io/DygDygWEB/base.txt, %A_Scriptdir%\base.txt
        MsgBox, "База загружена"
        config_start()
        FileRead, str, %File%
        names := StrSplit(str, pars_patern)
    }

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
    MouseMove, x_scroll, y_scroll
    Sleep, %delays%
    Sleep, %delays%
    Send, {LButton down}
    MouseMove, x_scroll2, y_scroll2
    Sleep, %delays%
    Sleep, %delays%
    Send, {LButton up}

    MouseMove, x_ok, y_ok

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
    MouseMove, %x%, %y%
    Sleep, 20
    Loop, 2
    {
        Loop, 11
        {
            if(GetKeyState("NumLock", "T")==1){
                MouseMove, %x%, %y% 
                Sleep, 30
                y := y + y_save2
                FileAppend -----------`n, %logs%
                scan()
            }
        }
        y := y_save
        x := x + y_save2
    }
    MouseMove, x_roll, y_roll
}

config_start()
{
    Gui, +AlwaysOnTop +Resize
    Gui, Add, Text, , Для открытия этого окна настроек нажми Alt+ F9
    Gui, Add, Text, , Нажать на кнопку и навестись на цель в течении 5 секунд
    Gui, Add, Text, , Не забудь кликнуть в окно игры, чтоб стало активным
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , Первый слот в торговле: %x_save%х%y_save%
    Gui, Add, Button, gGetSave, Назначить
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , Последний слот: %x_save2%х%y_save2%
    Gui, Add, Button, gGetSave2, Назначить
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , Старотовое положение скрола прокрутки: %x_scroll%х%y_scroll%
    Gui, Add, Button, gGetScroll, Назначить
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , Куда переместить скролл: %x_scroll2%х%y_scroll2%
    Gui, Add, Button, gGetScroll2, Назначить
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , Кнопка подтвердить: %x_ok%х%y_ok%
    Gui, Add, Button, gOk, Назначить
    Gui, Add, Text, , =======================================================
    Gui, Add, Text, , Кнопка рола: %x_roll%х%y_roll%
    Gui, Add, Button, gRoll, Назначить
    ; Gui, Add, Text, cBlue gLaunchGoogle, Щёлкните здесь, чтобы открыть Google
    Gui, Show, NoActivate, Настройки 
    return

    GetSave:
        Gui, Destroy
        Sleep, 5000
        MouseGetPos, x_save, y_save
        config_start()
        save()
        Return

    GetSave2:
        Gui, Destroy
        Sleep, 5000
        MouseGetPos, xxx, yyy
        a := (yyy-y_save)/10
        y_save2 := a
        x_save2 := a
        config_start()
        save()
        Return

    GetScroll:
        Gui, Destroy
        Sleep, 5000
        MouseGetPos, x_scroll, y_scroll
        config_start()
        save()
        Return

    GetScroll2:
        Gui, Destroy
        Sleep, 5000
        MouseGetPos, x_scroll2, y_scroll2
        config_start()
        save()
        Return

    Ok:
        Gui, Destroy
        Sleep, 5000
        MouseGetPos, x_ok, y_ok
        config_start()
        save()
        Return

    Roll:
        Gui, Destroy
        Sleep, 5000
        MouseGetPos, x_roll, y_roll
        config_start()
        save()
        Return
}


; F5::
;     {
;         logs := A_Scriptdir "\logs.txt"
;         datsss := StrSplit(clipboard, "`n").3
;         FileAppend 
;         (
;             %datsss%
;             ), %logs%
;         Return
;     }

F9::
    {
        Start_scan()
        return
    }

^F9::
    {
        config_start()
        Return
    }

; F7::
;     {
;         aaa := "TEST"
;         ; MsgBox %xxx% : %yyy%
;         MsgBox % Format("{:L}", aaa)
;         return
;     }