@echo off
:: Ensure working directory is always the script folder even when run as Administrator
cd /d "%~dp0"

title D2R to Traderie Pro Assistant
echo ===================================================
echo   Starting D2R to Traderie Pro Assistant...
echo   Folder: %~dp0
echo   (Press F10 in D2R to scan, F9 for fallback typing)
echo ===================================================
echo.

python d2r_traderie_pro.py

if errorlevel 1 (
    echo.
    echo ===================================================
    echo [Error Note] If Python failed to start:
    echo 1. Ensure Python is added to PATH (test by typing 'python --version' in cmd).
    echo 2. Ensure dependencies are installed via 'install_requirements.bat'.
    echo ===================================================
)

echo.
pause
