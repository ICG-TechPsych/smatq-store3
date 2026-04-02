@echo off
REM SMATQ Store - ClickPesa Integration Setup Script for Windows
REM This script helps you quickly set up the backend

echo.
echo ========================================
echo SMATQ Store - ClickPesa Setup
echo ========================================
echo.

REM Check if backend folder exists
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the product-cart directory
    pause
    exit /b 1
)

REM Check if .env exists
if not exist "backend\.env" (
    echo.
    echo [STEP 1] Creating .env file...
    echo Copying .env.example to .env
    copy "backend\.env.example" "backend\.env"
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env with your ClickPesa credentials:
    echo    - CLICKPESA_CLIENT_ID
    echo    - CLICKPESA_API_KEY  
    echo    - CLICKPESA_CHECKSUM_KEY
    echo.
    pause
) else (
    echo ✓ .env file exists
)

REM Install backend dependencies
echo.
echo [STEP 2] Installing backend dependencies...
cd backend
call npm install
cd ..

if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✓ Backend dependencies installed

REM Install frontend dependencies
echo.
echo [STEP 3] Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✓ Frontend dependencies installed

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo 📝 Next Steps:
echo.
echo 1. Edit backend\.env with your ClickPesa credentials
echo    - CLICKPESA_CLIENT_ID
echo    - CLICKPESA_API_KEY
echo    - CLICKPESA_CHECKSUM_KEY
echo.
echo 2. Start the servers:
echo.
echo    Terminal 1 (Frontend):
echo    npm run dev
echo.
echo    Terminal 2 (Backend):
echo    cd backend
echo    npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo 4. Read CLICKPESA_SETUP_GUIDE.md for full instructions
echo.
echo 📞 For issues, check backend logs and INTEGRATION_SUMMARY.md
echo.
pause
