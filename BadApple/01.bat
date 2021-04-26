@echo off
echo wscript.sleep 30 > sleep.vbs
set Count = 1
for /l %%A in (1,1,3286) do (set /a Count=%%A && call :prtScr)
pause
del /f /s /q sleep.vbs

:prtScr
title Frame %Count% / 3286
cls
type "ASCII-A (%Count%).txt"
@cscript sleep.vbs >nul