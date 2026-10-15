@echo off
chcp 65001 >nul
echo 正在请求管理员权限以放行 4322 端口（手机访问用）...
powershell -NoProfile -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c','netsh advfirewall firewall add rule name=\"XinghuiBlog 4322\" dir=in action=allow protocol=TCP localport=4322 && echo. && echo 已放行 4322 端口，现在手机可以访问了。 && pause'"
echo 如果弹出 UAC 窗口，请点「是」。
pause