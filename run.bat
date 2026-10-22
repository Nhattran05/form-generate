@echo off
chcp 65001 >nul
title Medical Form Generator - Launcher
cd /d "%~dp0"

echo ======================================================================
echo          HE THONG TAO MAU BENH AN TT 32/2023/TT-BYT
echo                    (Fullstack Launcher)
echo ======================================================================
echo.

:: 1. Kiem tra moi truong Backend
if not exist "backend\.venv\Scripts\python.exe" (
    echo [LOI] Khong tim thay moi truong ao tai 'backend\.venv'!
    echo Vui long tao moi truong ao va cai dat thu vien:
    echo   cd backend
    echo   python -m venv .venv
    echo   .\.venv\Scripts\pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

:: 2. Kiem tra thu vien Frontend
if not exist "frontend\node_modules" (
    echo [LOI] Khong tim thay thu muc 'frontend\node_modules'!
    echo Vui long cai dat dependencies cho frontend:
    echo   cd frontend
    echo   npm install
    echo.
    pause
    exit /b 1
)

echo [1/3] Dang khoi dong Backend FastAPI (Port 8000)...
start "Medical Forms - Backend (FastAPI)" cmd /k "cd /d ""%~dp0backend"" && title Medical Forms - Backend (FastAPI) && echo [FastAPI] Dang chay tai http://127.0.0.1:8000 ... && call .\.venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"

echo [2/3] Dang khoi dong Frontend Vite Studio (Port 5173)...
start "Medical Forms - Frontend (Vite Studio)" cmd /k "cd /d ""%~dp0frontend"" && title Medical Forms - Frontend (Vite) && echo [Vite] Dang chay tai http://localhost:5173 ... && npm run dev"

echo [3/3] Dang cho dich vu khoi dong...
timeout /t 3 /nobreak >nul

echo.
echo [HOAN TAT] He thong da san sang!
echo ----------------------------------------------------------------------
echo - Frontend Studio : http://localhost:5173
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo - API Health Check: http://127.0.0.1:8000/health
echo ----------------------------------------------------------------------
echo Dang mo trinh duyet...
start http://localhost:5173

echo.
echo Ban co the dong cua so launcher nay ma khong anh huong den Backend va Frontend.
echo De tat Backend hoac Frontend, chi can dong 2 cua so CMD tuong ung hoac nhan Ctrl+C.
echo.
pause
