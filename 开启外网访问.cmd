@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo  开启外网访问（手机在任何网络下都能打开本机站点）
echo ============================================================
echo.
echo 先确认本地站点已经在运行（另开一个窗口双击「启动网站(生产模式).cmd」）。
echo 下面会出现一个 https://xxx.lhr.life 的地址，手机用它可以打开；
echo 注意：这个地址是临时的，关掉本窗口就失效，每次重开地址也会变。
echo 想要固定地址，请把仓库推送到 GitHub，让 Vercel 部署（见 开发笔记.md）。
echo.
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o ServerAliveInterval=30 -R 80:127.0.0.1:4322 nokey@localhost.run
pause