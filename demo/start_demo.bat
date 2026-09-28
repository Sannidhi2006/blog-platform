@echo off
title College Demo Launcher - Blog Platform
echo ========================================================
echo        Starting MERN Blog Platform for Demo
echo ========================================================
echo.
echo Starting In-Memory Backend on port 5000...
start cmd /k "cd /d %~dp0..\backend && npm run dev:mem"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting Frontend on port 5173...
start cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo Demo servers launched!
echo Open your browser at http://localhost:5173
echo.
pause
