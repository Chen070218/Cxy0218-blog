@echo off
chcp 65001 >nul
echo Requesting administrator rights to open port 4322 (for phone access)...
powershell -NoProfile -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c','netsh advfirewall firewall add rule name=\"XinghuiBlog 4322\" dir=in action=allow protocol=TCP localport=4322 && echo. && echo Port 4322 is open. Your phone can connect now. && pause'"
echo If a UAC window appears, click "Yes".
pause
