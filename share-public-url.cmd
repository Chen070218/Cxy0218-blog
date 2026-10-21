@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo  Public access (open this local site from a phone on any network)
echo ============================================================
echo.
echo First make sure the local site is running (open another window and double-click "start-site-production.cmd").
echo An https://xxx.lhr.life address will appear below; your phone can open the site through it.
echo Note: this address is temporary. It dies when you close this window, and it changes every time you restart.
echo For a fixed address, push the repository to GitHub and let Vercel deploy it (see DEVELOPMENT.md).
echo.
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o ServerAliveInterval=30 -R 80:127.0.0.1:4322 nokey@localhost.run
pause
