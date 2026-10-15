@echo off
chcp 65001 >nul
cd /d "%~dp0XHBlogs"
if exist "%~dp0node\node.exe" set "PATH=%~dp0node;%PATH%"
set "NEXT_TELEMETRY_DISABLED=1"
where node >nul 2>nul
if errorlevel 1 (
 echo 请先安装 Node.js 20.9 或更新版本，再运行本文件。
 pause
 exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
 echo 首次启动需要联网安装依赖，请稍候。
 call npm ci --cache "%~dp0npm-cache"
 if errorlevel 1 (
  echo 安装失败，请检查网络后重试。
  pause
  exit /b 1
 )
)
if not exist ".next\BUILD_ID" (
 echo 正在构建生产版本（首次需要一两分钟，之后会很快）...
 call npx next build --webpack
 if errorlevel 1 (
  echo 构建失败，请看上面的报错。
  pause
  exit /b 1
 )
)
echo 网站地址：http://127.0.0.1:4322 （本机）
echo 使用期间请保留此窗口。
node node_modules\next\dist\bin\next start --hostname 0.0.0.0 --port 4322
pause

echo.
echo 手机访问（手机与本机要在同一个 Wi-Fi / 局域网）：
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { '   http://' + $_.IPAddress + ':4322' + '   (' + $_.InterfaceAlias + ')' }"
echo 如果手机打不开：Windows 防火墙可能拦了端口，右键「开启手机访问.cmd」以管理员身份运行一次即可。
echo.