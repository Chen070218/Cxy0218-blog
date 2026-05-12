@echo off
chcp 65001 >nul
title XingHuiSama 双端升级程序

echo ===================================================
echo ===================================================
echo.

:: 👇 新增防御 1：检查电脑是否安装了 Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 致命错误喵：你的电脑没有安装 Git！
    echo 需要 Git 才能进行“外科手术”式精准更新。
    echo 请前往 https://git-scm.com/ 下载安装 Git 后再重试。
    echo.
    pause
    exit /b
)

:: 👇 新增防御 2：如果是 ZIP 下载版，自动变身 Git 仓库！
if not exist ".git" (
    echo ⚠️ 检测到当前项目可能是 ZIP 下载包，缺少 Git 仓库环境。
    echo 🪄 自动将其升级为 Git 仓库模式...
    git init
    git remote add origin https://github.com/heiehiehi/XinghuisamaBlogs.git
    echo ✅ 环境升级完成！
    echo.
)

echo 📡 获取最新蓝图...
git fetch origin main
if %errorlevel% neq 0 (
    echo ❌ 网络连接失败喵，请检查你的网络环境。
    pause
    exit /b
)

echo.
echo ⚙️ 正在执行核心文件精准替换，请不要关闭窗口...

:: ==========================================================
:: 📂 模块一：项目根目录文件 (总说明与更新脚本本身)
:: ==========================================================
git checkout origin/main -- ^
  LICENSE ^
  README.md ^
  scripts/checkConfig.mjs

:: ==========================================================
:: 🎨 模块二：XHBlogs (前端展示端)
:: ==========================================================
git checkout origin/main -- ^
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
  XHBlogs/tsconfig.json

:: ==========================================================
:: 🛠️ 模块三：my-blog-manager (后台管理端)
:: ==========================================================
git checkout origin/main -- ^
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

if %errorlevel% neq 0 (
    echo ⚠️ 警告喵：文件替换时出现异常，可能是你本地有严重的冲突。
)

echo.
echo 📦 [1/2] 正在同步 XHBlogs 的依赖包...
cd XHBlogs
call npm install
cd ..

echo.
echo 📦 [2/2] 正在同步 my-blog-manager 的依赖包...
cd my-blog-manager
call npm install
cd ..

echo.
echo ===================================================
echo 🛠️ 正在扫描并智能修补 siteConfig 配置文件...
echo ===================================================
node scripts/checkConfig.mjs

echo.
echo ===================================================
echo ✨ 喵！双端引擎升级完毕！你的私有数据完好无损！
echo 🚀 现在可以去启动你的项目了！
echo ===================================================
echo.
pause