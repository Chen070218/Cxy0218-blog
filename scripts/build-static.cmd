@echo off
rem Build the site as a fully static export (for Cloudflare Pages / GitHub Pages).
rem Usage:  scripts\build-static.cmd
rem         set NEXT_PUBLIC_BASE_PATH=/repo-name  &  scripts\build-static.cmd   (project subpath hosting)
rem Static export has no server, so app\api is moved aside for the build and restored afterwards.
setlocal
set "PROJ=%~dp0.."
set "NEXT_TELEMETRY_DISABLED=1"
set "STATIC_EXPORT=1"
cd /d "%PROJ%\XHBlogs"

if exist "app\_api_disabled" (
  echo [x] app\_api_disabled already exists - a previous build did not finish cleanly.
  exit /b 1
)
if exist "app\api" move "app\api" "app\_api_disabled" >nul
if not exist "app\_api_disabled" (
  echo [x] could not move app\api aside.
  exit /b 1
)

"%PROJ%\node\node.exe" "node_modules\next\dist\bin\next" build --webpack
set "RC=%ERRORLEVEL%"

if exist "app\_api_disabled" move "app\_api_disabled" "app\api" >nul

if "%RC%"=="0" (
  echo [ok] static export written to %PROJ%\XHBlogs\out
) else (
  echo [x] build failed with code %RC%
)
exit /b %RC%
