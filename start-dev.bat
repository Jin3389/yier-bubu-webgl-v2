@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo [1/2] Installing dependencies...
  call npm install
)
echo [2/2] Starting Vite dev server...
call npm run dev
pause
