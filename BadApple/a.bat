@echo off
set /a Count = "1"
for /l %%A in (1,1,3286) do (set /a Count=%%A && call :prtScr)
pause
:prtScr
rem echo.>> frames.txt
echo "a: " + %Count%
type "ASCII-A (%Count%).txt">> frames.txt
echo :frame:>> frames.txt
