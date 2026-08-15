@echo off
REM Full Track POS - Web Version Startup Script (Windows)

echo.
echo ╔════════════════════════════════════════╗
echo ║     Full Track POS - Web Version      ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo Error instalando dependencias
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor...
echo.

npm start

pause
