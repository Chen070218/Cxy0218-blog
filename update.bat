@echo off
:: 🌟 核心修复：这一行能保证无论是否以管理员运行，脚本都会回到它自己所在的文件夹
cd /d "%~dp0"

title XingHuiSama Update Tool
color 0B

echo ===================================================
echo    XingHuiSama Blog Update Script (Admin Fixed)
echo ===================================================
echo.

:: 1. Check Git Environment
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed! Please install Git first.
    pause
    exit /b
)

:: 2. Check Git Repo
if not exist ".git" (
    echo [INFO] Initializing Git environment...
    git init
    git remote add origin https://github.com/heiehiehi/XinghuisamaBlogs.git
)

echo [1/4] Connecting to GitHub...
git fetch origin main
if %errorlevel% neq 0 (
    echo [ERROR] Network error! Check your connection or Proxy.
    pause
    exit /b
)

echo [2/4] Updating core files...
:: --- ATTENTION: No space after ^ ---
git checkout origin/main -- ^
  LICENSE ^
  README.md ^
  scripts/checkConfig.mjs ^
  XHBlogs/app/about/page.tsx ^
  XHBlogs/app/api ^
  XHBlogs/app/chatter ^
  XHBlogs/app/friends ^
  XHBlogs/app/moments ^
  XHBlogs/app/music ^
  XHBlogs/app/photowall ^
  XHBlogs/app/posts ^
  XHBlogs/app/projects ^
  XHBlogs/app/timeline ^
  XHBlogs/app/globals.css ^
  XHBlogs/app/layout.tsx ^
  XHBlogs/app/page.tsx ^
  XHBlogs/components ^
  XHBlogs/context ^
  XHBlogs/.gitignore ^
  XHBlogs/package.json ^
  XHBlogs/package-lock.json ^
  XHBlogs/postcss.config.mjs ^
  XHBlogs/tsconfig.json ^
  my-blog-manager/app/about/page.tsx ^
  my-blog-manager/app/admin ^
  my-blog-manager/app/api ^
  my-blog-manager/app/chatter ^
  my-blog-manager/app/drafts ^
  my-blog-manager/app/editor ^
  my-blog-manager/app/friends ^
  my-blog-manager/app/moments ^
  my-blog-manager/app/music ^
  my-blog-manager/app/photowall ^
  my-blog-manager/app/posts ^
  my-blog-manager/app/projects ^
  my-blog-manager/app/settings ^
  my-blog-manager/app/timeline ^
  my-blog-manager/app/globals.css ^
  my-blog-manager/app/layout.tsx ^
  my-blog-manager/app/page.tsx ^
  my-blog-manager/cms_core ^
  my-blog-manager/components ^
  my-blog-manager/context ^
  my-blog-manager/.gitignore ^
  my-blog-manager/launcher.py ^
  my-blog-manager/package.json ^
  my-blog-manager/package-lock.json ^
  my-blog-manager/postcss.config.mjs ^
  my-blog-manager/run_me.py ^
  my-blog-manager/Start.bat ^
  my-blog-manager/tsconfig.json

echo [3/4] Installing dependencies...
:: 使用更为稳妥的路径执行方式
if exist "XHBlogs" (
    echo Syncing XHBlogs...
    cd XHBlogs && call npm install && cd ..
)
if exist "my-blog-manager" (
    echo Syncing my-blog-manager...
    cd my-blog-manager && call npm install && cd ..
)

echo [4/4] Patching siteConfig...
if exist "scripts\checkConfig.mjs" (
    node scripts/checkConfig.mjs
)

echo ===================================================
echo    Update Successful!！
echo ===================================================
pause