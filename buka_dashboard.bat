@echo off
title KDMP Dashboard Launcher
echo ========================================================
echo   Membuka KDMP Social Media Analytics Dashboard...
echo ========================================================
echo.

cd /d "%~dp0frontend"

echo Memulai server Vite... Browser akan terbuka otomatis.
echo.
call npm run dev

pause
