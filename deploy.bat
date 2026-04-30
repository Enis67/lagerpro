@echo off
cd /d "C:\Projekte\Material-buchen-app"
echo.
echo  =========================================
echo   LagerPro - DEPLOY
echo  =========================================
echo.
echo  [1] Lokal starten (PC + Handy im WLAN)
echo  [2] Netlify Drop (ZIP hochladen)
echo  [3] Nur Build anzeigen
echo.
set /p choice="Wahl (1/2/3): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto netlify
if "%choice%"=="3" goto buildonly
goto end

:local
echo.
echo  Starte Server fuer Handy-Zugriff...
echo.
npx serve dist --listen 3000 --single
goto end

:netlify
echo.
echo  Oeffne Netlify Drop im Browser...
echo  Ziehe den dist-Ordner auf die Seite.
echo.
start https://app.netlify.com/drop
goto end

:buildonly
echo.
echo  Build-Ordner: C:\Projekte\Material-buchen-app\dist\
echo  Dateien:
dir /b dist
goto end

:end
echo.
pause
