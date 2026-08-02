@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  Edu_AI_Child — Windows Launcher
::  Starts the Edu AI learning platform and opens the browser
:: ============================================================

title Edu_AI_Child Launcher

:: ── Colourful banner ────────────────────────────────────────
color 0A
echo.
echo  ================================================================
echo   .---.  .---. .   .      /\   ___     _   _   _     .---. .  .
echo   ^|---'  ^|   ^| ^|   ^|     /  \  ^|      ^|   ^|  ^`-^'    ^|     ^|__^|
echo   ^|---.  ^|   ^| ^|   ^|    / -- \ ^|   .  ^|   ^|   .-.    ^|---  ^|  ^|
echo   ^|---'  ^`---' ^`---'   /      \ ^`---'  ^`---'  ^`-^'    ^`---. ^|  ^|
echo.
echo                 ★  Children's Learning Platform  ★
echo  ================================================================
echo.
color 0E
echo   🎓 Grades 1-10  ^|  🌍 14 Languages  ^|  🎬 345 Films  ^|  🏛 Museum
color 0A
echo.

:: ── Check Node.js ───────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Node.js is not installed.
    echo  Download it from: https://nodejs.org/en/download/
    echo.
    pause
    exit /b 1
)

:: ── Check Python ────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Python 3 is not installed.
    echo  Download it from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

:: ── Frontend build ──────────────────────────────────────────
color 0B
echo  [1/3] Setting up frontend...
color 07
cd /d "%ROOT%\frontend"
if not exist "node_modules\" (
    echo       Installing Node packages ^(first run only^)...
    call npm install
)
echo       Building React app...
call npm run build >nul 2>&1
color 0A
echo       Frontend ready ✓
echo.

:: ── Python virtualenv & backend ─────────────────────────────
color 0B
echo  [2/3] Setting up backend...
color 07
cd /d "%ROOT%\backend"
if not exist ".venv\" (
    echo       Creating Python environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat
pip install -q -r requirements.txt
color 0A
echo       Backend ready ✓
echo.

:: ── Launch ──────────────────────────────────────────────────
color 0B
echo  [3/3] Starting Edu_AI_Child...
color 07
echo.
color 0E
echo  ★  App launching at: http://localhost:8000
color 0A
echo  ★  Press Ctrl+C to stop the server
echo.
color 07

:: Open browser after 3 seconds
start "" cmd /c "timeout /t 3 >nul && start http://localhost:8000"

:: Start FastAPI
cd /d "%ROOT%\backend"
call .venv\Scripts\activate.bat
uvicorn app.main:app --host 0.0.0.0 --port 8000

pause
