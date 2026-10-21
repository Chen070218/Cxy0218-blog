@echo off
chcp 65001 >nul
cd /d "%~dp0XHBlogs"
if exist "%~dp0node\node.exe" set "PATH=%~dp0node;%PATH%"
set "NEXT_TELEMETRY_DISABLED=1"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 20.9 or newer is required. Install it, then run this file again.
 pause
 exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
 echo The first run needs to install dependencies over the network. Please wait.
 call npm ci --cache "%~dp0npm-cache"
 if errorlevel 1 (
  echo Installation failed. Check your network connection and try again.
  pause
  exit /b 1
 )
)
if not exist ".next\BUILD_ID" (
 echo Building the production version (the first build takes a minute or two, later builds are fast)...
 call npx next build --webpack
 if errorlevel 1 (
  echo Build failed. See the errors above.
  pause
  exit /b 1
 )
)
echo Site URL: http://127.0.0.1:4322 (this machine)
echo Keep this window open while you use the site.
node node_modules\next\dist\bin\next start --hostname 0.0.0.0 --port 4322
pause

echo.
echo Phone access (the phone and this PC must be on the same Wi-Fi / LAN):
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { '   http://' + $_.IPAddress + ':4322' + '   (' + $_.InterfaceAlias + ')' }"
echo If the phone cannot connect: the Windows firewall may be blocking the port. Right-click "share-lan.cmd" and run it once as administrator.
echo.
