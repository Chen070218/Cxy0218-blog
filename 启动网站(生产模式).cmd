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
echo 网站地址（生产模式，速度和线上一致）：http://127.0.0.1:4322
echo 使用期间请保留此窗口。
node node_modules\next\dist\bin\next start --hostname 127.0.0.1 --port 4322
pause