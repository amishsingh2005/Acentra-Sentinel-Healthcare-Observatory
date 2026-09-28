@echo off
title Acentra Sentinel

echo.
echo  ============================================
echo   ACENTRA SENTINEL
echo   Real-Time Healthcare Operations Intelligence
echo  ============================================
echo.

:: ── Paths ──────────────────────────────────────
set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

:: ── Check Python ────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

:: ── Check Node ──────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found in PATH.
    echo         Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found in PATH.
    pause
    exit /b 1
)

:: ── Check uvicorn ───────────────────────────────
python -c "import uvicorn" >nul 2>&1
if errorlevel 1 (
    echo [SETUP] Installing Python dependencies...
    pip install fastapi uvicorn websockets pydantic python-dotenv >nul 2>&1
    echo [OK]    Python dependencies installed.
)

:: ── Check node_modules ──────────────────────────
if not exist "%FRONTEND%\node_modules" (
    echo [SETUP] Installing frontend dependencies - first run only, takes ~1 min...
    cd /d "%FRONTEND%"
    call npm install >nul 2>&1
    echo [OK]    Frontend dependencies installed.
    cd /d "%ROOT%"
)

:: ── Prepare data directory ──────────────────────
if not exist "%BACKEND%\data" (
    mkdir "%BACKEND%\data"
)
echo. > "%BACKEND%\data\application.log"

echo [OK]    Starting services...
echo.
echo  Backend  →  http://localhost:8000
echo  Frontend →  http://localhost:3000
echo  API Docs →  http://localhost:8000/docs
echo.
echo  Press Ctrl+C in each window to stop.
echo.

:: ── Start Backend in new window ─────────────────
start "Acentra Sentinel — Backend" cmd /k "cd /d "%BACKEND%" && echo Starting FastAPI backend... && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: ── Wait 2 seconds for backend to boot ──────────
timeout /t 2 /nobreak >nul

:: ── Start Frontend in new window ─────────────────
start "Acentra Sentinel — Frontend" cmd /k "cd /d "%FRONTEND%" && echo Starting Vite dev server... && npm run dev"

:: ── Wait for frontend to start ──────────────────
timeout /t 4 /nobreak >nul

:: ── Open browser ────────────────────────────────
echo [OK]    Opening dashboard in browser...
start "" "http://localhost:3000"

echo.
echo  ============================================
echo   Both servers are running in separate windows.
echo   Close those windows to stop Acentra Sentinel.
echo  ============================================
echo.
pause
