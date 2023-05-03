#SingleInstance Force
SendMode("Event")
SetWorkingDir(A_ScriptDir)
CoordMode("Mouse", "Client")

currentVersion := 12

files := {
    config: "config.ini",
    DB: "base.dat",
    logs: "logs.txt"
}
program := {
    firstRun: false,
    mouseSpeed: IniRead(files.config, "speed", "mouseSpeed", "2"),
    gameName: IniRead(files.config, "game", "exe_name", "PathOfExileSteam.exe"),
    scan: false,
    gui_toggle: false,
    pattern: "`n",
    names: [],
    x_save: IniRead(files.config, "start position", "x", "337"),
    y_save: IniRead(files.config, "start position", "y", "279"),
    x_save2: IniRead(files.config, "end position", "x", "53"),
    y_save2: IniRead(files.config, "end position", "y", "53"),
    x_ok: IniRead(files.config, "ok position", "x", "618"),
    y_ok: IniRead(files.config, "ok position", "y", "866"),
    x_scroll: IniRead(files.config, "scroll position start", "x", "73"),
    y_scroll: IniRead(files.config, "scroll position start", "y", "80"),
    x_scroll2: IniRead(files.config, "scroll position end", "x", "659"),
    y_scroll2: IniRead(files.config, "scroll position end", "y", "798"),
    x_roll: IniRead(files.config, "roll position", "x", "954"),
    y_roll: IniRead(files.config, "roll position", "y", "844"),
    x_Inv: IniRead(files.config, "Inv position", "x", "1336"),
    y_Inv: IniRead(files.config, "Inv position", "y", "573"),
    delays: IniRead(files.config, "others", "delays", "50"),
}
hotkeys := {
    toggle: IniRead(files.config, "hotkeys", "toggleWindow", "^f9"),
    run: IniRead(files.config, "hotkeys", "runScan", "f9"),
    deb: IniRead(files.config, "hotkeys", "test", "f7"),
    inv: IniRead(files.config, "hotkeys", "inv", "f3"),
}

if (!FileExist(files.config)) {
    program.firstRun := true
    Ini := "
        (Ltrim
; # = win
; ^ = ctrl
; ! = alt
; + = shit`n`n
)"
    FileAppend(ini, files.config)
}
if (!A_IsCompiled) {
    IniWrite(currentVersion, files.config, "others", "vers")
}
SetDefaultMouseSpeed(program.mouseSpeed)

Hotkey("~$" . hotkeys.toggle, GuiToggler, 'On')
Hotkey("~$" . hotkeys.run, ToggleScan, 'On')

Hotkey("~$" . hotkeys.inv, ScipInventory, 'On')

Hotkey("~$^End", key => ProcessClose(WinGetPID("A")))
Hotkey("~$Pause", key => Pause(!A_IsPaused))

if (FileExist(files.DB)) {
    program.names := StrSplit(Fileread(files.DB), program.pattern)
} else {
    Download("https://dygdyg.github.io/DygDygWEB/PoE/autoroll/base.dat", files.DB)
    MsgBox("База загружена", "msg", "t5")
    program.names := StrSplit(Fileread(files.DB), program.pattern)
}

;#region GUI
myGui := Gui("+AlwaysOnTop +LastFound -Resize", "Настройки. Версия: " currentVersion)
myGui.MarginX := myGui.MarginY := 5
myGui.OnEvent("Close", GuiToggler)
; myGui.Opt()
myGui.AddText("x5", "Для открытия этого окна настроек нажми Ctrl + F9")
myGui.AddText("x5", "Нажать на кнопку и навестись на цель в течении 5 секунд")
myGui.AddText("x5", "Не забудь кликнуть в окно игры, чтоб стало активным")
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
startText := myGui.AddText("h24 0x200 x+m yp", "Первый слот в торговле: " . program.x_save . "х" . program.y_save)
ogcButton.OnEvent("Click", SaveStartPos)
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
endText := myGui.AddText("h24 0x200 x+m yp", "Последний слот: " . program.x_save2 . "х" . program.y_save2)
ogcButton.OnEvent("Click", SaveEndPos)
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
myGui.AddText("h24 0x200 x+m yp", "Стартовое положение ползунка: " . program.x_scroll . "х" . program.y_scroll)
ogcButton.OnEvent("Click", SaveScrollStart)
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
myGui.AddText("h24 0x200 x+m yp", "Куда переместить ползунок: " . program.x_scroll2 . "х" . program.y_scroll2)
ogcButton.OnEvent("Click", SaveScrollSet)
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
myGui.AddText("h24 0x200 x+m yp", "Кнопка подтвердить: " . program.x_ok . "х" . program.y_ok)
ogcButton.OnEvent("Click", SaveBuyItem)
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
rollText := myGui.AddText("h24 0x200 x+m yp", "Кнопка рола: " . program.x_roll . "х" . program.y_roll)
ogcButton.OnEvent("Click", SaveRoll)
myGui.AddText("x5", "=======================================================")
ogcButton := myGui.AddButton("x5", "Назначить")
InvText := myGui.AddText("h24 0x200 x+m yp", "Первый слот инвентаря: " . program.x_Inv . "х" . program.y_Inv)
ogcButton.OnEvent("Click", SaveInv)
myGui.AddText("x5", "=======================================================")
myGui.AddText("x5", "ScrollLock - авторерол")
myGui.AddText("x5", "CapsLock - даблпроход")
myGui.Show(Format("{1}", program.firstRun ? "" : "Hide"))
;#endregion

GuiToggler(key) {
    program.gui_toggle := !program.gui_toggle
    if (program.gui_toggle)
        myGui.Show()
    else
        myGui.Hide()
}

SaveConfig() {
    ;корость мышки
    IniWrite(program.mouseSpeed, files.config, "speed", "mouseSpeed")

    ;Кнопки
    IniWrite(hotkeys.toggle, files.config, "hotkeys", "toggleWindow")
    IniWrite(hotkeys.run, files.config, "hotkeys", "runScan")
    IniWrite(hotkeys.deb, files.config, "hotkeys", "test")

    ;Стартовая позиция
    IniWrite(program.x_save, files.config, "start position", "x")
    IniWrite(program.y_save, files.config, "start position", "y")

    ;Вторая ячейка, для подсчёта ширины и высоты
    IniWrite(program.x_save2, files.config, "end position", "x")
    IniWrite(program.y_save2, files.config, "end position", "y")

    ;Положение ползунка скрола
    IniWrite(program.x_scroll, files.config, "scroll position start", "x")
    IniWrite(program.y_scroll, files.config, "scroll position start", "y")

    ;Положение куда крутить
    IniWrite(program.x_scroll2, files.config, "scroll position end", "x")
    IniWrite(program.y_scroll2, files.config, "scroll position end", "y")

    ;Положение кнопки продажи
    IniWrite(program.x_ok, files.config, "ok position", "x")
    IniWrite(program.y_ok, files.config, "ok position", "y")

    ;Положение кнопки рола
    IniWrite(program.x_roll, files.config, "roll position", "x")
    IniWrite(program.y_roll, files.config, "roll position", "y")

    ;Первый слот инвентаря
    IniWrite(program.x_Inv, files.config, "Inv position", "x")
    IniWrite(program.y_Inv, files.config, "Inv position", "y")

    ;Дополнительная задержка
    IniWrite(program.delays, files.config, "others", "delays")
}
SaveConfig()

ToggleMouseBtn(state) {
    Hotkey('vk1', key => {}, state)
}

GetPos(&x, &y) {
    ToggleMouseBtn('On')
    Sleep(250)
    myGui.Hide()

    if (WinExist("ahk_class POEWindowClass")) {
        WinActivate("ahk_class POEWindowClass")
        OutputDebug('OK')
    }

    KeyWait("vk1", "D")
    MouseGetPos(&x, &y)
    Sleep(250)

    myGui.Show()
    ToggleMouseBtn('Off')
}

SaveStartPos(*) {
    GetPos(&x, &y)
    program.x_save := x
    program.y_save := y
    startText.Value := "Первый слот в торговле: " . program.x_save . "х" . program.y_save
    SaveConfig()
}

SaveEndPos(*) {
    GetPos(&x, &y)

    a := Format("{:.0f}", (y - program.y_save) / 10)

    program.x_save2 := a
    program.y_save2 := a

    endText.Value := "Последний слот: " . program.x_save2 . "х" . program.y_save2
    SaveConfig()
}

SaveScrollStart(*) {
    GetPos(&x, &y)
    program.x_scroll := x
    program.y_scroll := y
    startText.Value := "Стартовое положение ползунка: " . program.x_scroll . "х" . program.y_scroll
    SaveConfig()
}

SaveScrollSet(*) {
    GetPos(&x, &y)
    program.x_scroll2 := x
    program.y_scroll2 := y
    startText.Value := "Куда переместить ползунок: " . program.x_scroll2 . "х" . program.y_scroll2
    SaveConfig()
}

SaveBuyItem(*) {
    GetPos(&x, &y)
    program.x_ok := x
    program.y_ok := y
    startText.Value := "Кнопка подтвердить: " . program.x_ok . "х" . program.y_ok
    SaveConfig()
}

SaveRoll(*) {
    GetPos(&x, &y)
    program.x_roll := x
    program.y_roll := y
    rollText.Value := "Кнопка рола: " . program.x_roll . "х" . program.y_roll
    SaveConfig()
}

SaveInv(*) {
    GetPos(&x, &y)
    program.x_Inv := x
    program.y_Inv := y
    InvText.Value := "Первый слот инвентаря: " . program.x_Inv . "х" . program.y_Inv
    SaveConfig()
}

ToggleScan(key) {
    program.scan := !program.scan
    f := StartScan.Bind(false)
    if (program.scan) {
        SetTimer(f, -100)
    }
    else {
        SetTimer(f, 0)
    }
}

StartScan(repeat) {
    if (FileExist(files.logs))
        FileDelete(files.logs)
    x := program.x_save
    y := program.y_save
    MouseMove(x + Random(-5, 5), y + Random(-5, 5))
    OutputDebug(repeat)
    Loop 2 {
        if (!program.scan)
            return
        Loop 11 {
            if (!program.scan)
                return
            MouseMove(x + Random(-5, 5), y + Random(-5, 5))
            Sleep(15)
            y += program.y_save2
            GetItem()
        }
        y := program.y_save
        x += program.y_save2
    }

    if (GetKeyState("CapsLock", "T") == 1 && !repeat) {
        f := StartScan.Bind(true)
        SetTimer(f, -100)
        return
    }

    MouseMove(program.x_roll + Random(-5, 5), program.y_roll + Random(-5, 5))
    if (GetKeyState("ScrollLock", "T") == 1) {
        if (!program.scan)
            return
        Send("{vk1}")
        if (!program.scan)
            return
        f := StartScan.Bind(false)
        SetTimer(f, -1000)
    } else {
        program.scan := false
    }

}

GetItem() {
    Send("^c")
    if (program.delays < 50)
        program.delays := 50
    Sleep(program.delays)

    datsss := StrSplit(A_Clipboard, "`r`n")
    if (!datsss.Has(3))
        return
    text := Format("Предмет: [{1}]", datsss[3])
    loop program.names.Length {
        if (InStr(StrLower(A_Clipboard), Trim(StrLower(program.names[A_Index]))) > 0) {
            Sleep(100)
            Send("{vk1}")
            Sleep(100)
            BuyItem()
            Sleep(100)
            text .= " -> <<< куплено >>>"
            break
        }
    }
    ; FileAppend(text . "`n", files.logs)
    A_Clipboard := ""
}

BuyItem() {
    if (!program.scan)
        return
    MouseMove(program.x_scroll + Random(-5, 5), program.y_scroll + Random(-5, 5))
    Sleep(program.delays)
    if (!program.scan)
        return
    Send("{vk1 down}")
    MouseMove(program.x_scroll2 + Random(-5, 5), program.y_scroll2 + Random(-5, 5))
    Sleep(program.delays)
    if (!program.scan)
        return
    Send("{vk1 up}")
    MouseMove(program.x_ok + Random(-5, 5), program.y_ok + Random(-5, 5))

    if (!program.scan)
        return
    Sleep(program.delays)
    if (!program.scan)
        return
    Send("{vk1}")
    Sleep(300)
    if (!program.scan)
        return
    Send("{vk1}")
    Sleep(30)
    if (!program.scan)
        return
}

ScipInventory(key)
{
    if (WinExist("ahk_class POEWindowClass")) {
        WinActivate("ahk_class POEWindowClass")
        OutputDebug('OK')

        Send("{Ctrl down}")
        x := program.x_Inv
        y := program.y_Inv
        loop (12)
        {
            loop (5)
            {
                MouseMove(x + Random(-5, 5), y + Random(-5, 5), 1)
                Send("{vk1}")
                ; OutputDebug("test")
                y := y + program.y_save2
            }
            y := program.y_Inv
            x := x + program.x_save2
        }
        Send("{Ctrl up}")
    }
}

; OnError(ErrorFunc)
ErrorFunc(*) {
    return true
}

if (A_IsCompiled) {
    onlineVer := "ver.ini"
    Download("https://dygdyg.github.io/DygDygWEB/PoE/autoroll/config.ini", onlineVer)
    VersOnline := IniRead(onlineVer, "others", "vers", 1)
    FileDelete(onlineVer)
    if (currentVersion < VersOnline)
    {
        Download("https://dygdyg.github.io/DygDygWEB/PoE/autoroll/autoroll.exe", "new.exe")

        cmd := Format('cmd /c taskkill /f /im "{1}" && timeout /t 1 && del "{2}" && ren new.exe "{1}" && start "" "{2}"', A_ScriptName, A_ScriptFullPath)
        RunWait(cmd, , "hide")
    }
}