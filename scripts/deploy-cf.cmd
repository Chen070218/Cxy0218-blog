@echo off
rem One-shot deploy to Cloudflare Pages (static export + Pages Functions).
rem Prerequisite: run  scripts\cf.cmd login  once (browser authorization).
rem Usage: scripts\deploy-cf.cmd
setlocal
set "PROJ=%~dp0.."
set "CF_PROJECT=cxy0218-blog"
set "CF_BRANCH=main"

rem The static export must not carry the GitHub Pages sub-path prefix.
set "NEXT_PUBLIC_BASE_PATH="
call "%PROJ%\scripts\build-static.cmd"
if errorlevel 1 exit /b 1

cd /d "%PROJ%\XHBlogs"
call "%PROJ%\scripts\cf.cmd" pages deploy out --project-name=%CF_PROJECT% --branch=%CF_BRANCH%
exit /b %ERRORLEVEL%
