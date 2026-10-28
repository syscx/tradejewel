@echo off
:: Ensure working directory is always the script folder even when run as Administrator
cd /d "%~dp0"

title Installing D2R Traderie Pro Dependencies
echo ===================================================
echo Installing required Python packages...
echo Folder: %~dp0
echo ===================================================
echo.
pip install -r requirements.txt
echo.
echo [OK] All dependencies installed successfully!
echo You can now run 'run_assistant.bat'.
echo.
pause
