@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dpn0.ps1" -Mode Serve
if errorlevel 1 pause
