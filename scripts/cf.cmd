@echo off
rem Cloudflare deploy helper: passes all arguments straight to wrangler.
rem usage: scripts\cf.cmd pages dev out --port 4399
rem        scripts\cf.cmd pages deploy out --project-name=cxy0218-blog --branch=main
setlocal
set "PROJ=%~dp0.."
set "XDG_CONFIG_HOME=%PROJ%\.wrangler-cfg"
set "WRANGLER_SEND_METRICS=false"
"%PROJ%\node\node.exe" "%PROJ%\tools\node_modules\wrangler\bin\wrangler.js" %*
exit /b %ERRORLEVEL%
