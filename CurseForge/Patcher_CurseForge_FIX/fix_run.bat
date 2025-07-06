@echo off
Taskkill /IM CurseForge.exe /F

set patch1=%userprofile%\AppData\Local\Programs\CurseForge Windows\resources\
set patch2=app\dist\desktop\
set param1=-aoa -bse0 -bso0 -bsp0

del /Q %patch1%app
@REM mkdir %patch1%app
7-zip\7z.exe x %param1% "%patch1%app.asar" -o"%patch1%app\"

@REM pause 
echo ^<link rel="stylesheet" href="style.css"^> > "%patch1%%patch2%fix.bc"
type  "%patch1%%patch2%desktop.html" >>  "%patch1%%patch2%fix.bc"
copy  "%patch1%%patch2%desktop.html"  "%patch1%%patch2%desktop.html.bc"
@REM del desktop.html
copy  "%patch1%%patch2%fix.bc"  "%patch1%%patch2%desktop.html"
del  "%patch1%%patch2%fix.bc"

copy  "%patch1%app.asar" "%patch1%app.asar.bc"
del  "%patch1%app.asar"

@REM echo %appdata%\..\Local\Programs\CurseForge Windows\resources\app\dist\desktop

echo  .original-image, aside.curseforge-ad, button.btn-single-icon.run-game{display: none !important;} >  "%patch1%%patch2%style.css"
echo on
start "" "%userprofile%\AppData\Local\Programs\CurseForge Windows\CurseForge.exe"

@REM pause