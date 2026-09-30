@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Run npm ci in this folder first.
  pause
  exit /b 1
)
start "Local AI models" cmd /k npm run server
start "Global Dashboard" cmd /k npm run dev
echo Open http://127.0.0.1:5173 once Vite is ready.
pause
