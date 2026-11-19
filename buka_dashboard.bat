@echo off
title KDMP Dashboard Launcher
echo ========================================================
echo   Membuka KDMP Social Media Analytics Dashboard...
echo ========================================================
echo.

cd /d "%~dp0frontend"

if not exist node_modules (
  echo Pertama kali dijalankan: memasang dependensi ^(npm install^)...
  call npm install
  echo.
)

echo Memulai server Vite... Browser akan terbuka otomatis.
echo.
call npm run dev

pause
