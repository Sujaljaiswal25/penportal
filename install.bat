@echo off
echo ========================================
echo    PenPortal - Installation Script
echo ========================================
echo.

echo Installing Server Dependencies...
cd server
call npm install express-validator
if %errorlevel% neq 0 (
    echo ERROR: Server installation failed!
    pause
    exit /b 1
)
echo Server dependencies installed successfully!
echo.

echo Installing Client Dependencies...
cd ..\client
call npm install react-router-dom axios socket.io-client react-quill react-hot-toast lucide-react date-fns dompurify react-intersection-observer
if %errorlevel% neq 0 (
    echo ERROR: Client installation failed!
    pause
    exit /b 1
)
echo Client dependencies installed successfully!
echo.

cd ..
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open TWO terminal windows
echo 2. Terminal 1: cd server && npm run dev
echo 3. Terminal 2: cd client && npm run dev
echo 4. Open http://localhost:5173 in your browser
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
pause
