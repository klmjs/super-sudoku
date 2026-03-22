@echo OFF

start cmd /k "cd /d .\dist && python3 -m http.server 8080"

python3 -m http.server 80

pause
