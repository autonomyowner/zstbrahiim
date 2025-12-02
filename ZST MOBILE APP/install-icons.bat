@echo off
echo ========================================
echo ZST Icon Installation Script
echo ========================================
echo.

REM Set source (Downloads folder) and destination
set "SOURCE=%USERPROFILE%\Downloads"
set "DEST=D:\APP ZST\zstmapp 1\assets\images"

echo Looking for icons in: %SOURCE%
echo.

REM Check if icons exist
if not exist "%SOURCE%\zst-icon-main.png" (
    echo ERROR: Could not find zst-icon-main.png in Downloads folder
    echo Please check your browser's Downloads folder for the icon files.
    echo.
    pause
    exit /b 1
)

echo Found icons! Copying to project...
echo.

REM Copy main icon (3 times)
echo [1/6] Copying app-icon-all.png...
copy /Y "%SOURCE%\zst-icon-main.png" "%DEST%\app-icon-all.png"

echo [2/6] Copying app-icon-android-legacy.png...
copy /Y "%SOURCE%\zst-icon-main.png" "%DEST%\app-icon-android-legacy.png"

echo [3/6] Copying app-icon-ios.png...
copy /Y "%SOURCE%\zst-icon-main.png" "%DEST%\app-icon-ios.png"

REM Copy adaptive icons
echo [4/6] Copying app-icon-android-adaptive-foreground.png...
copy /Y "%SOURCE%\zst-icon-foreground.png" "%DEST%\app-icon-android-adaptive-foreground.png"

echo [5/6] Copying app-icon-android-adaptive-background.png...
copy /Y "%SOURCE%\zst-icon-background.png" "%DEST%\app-icon-android-adaptive-background.png"

REM Copy favicon
echo [6/6] Copying app-icon-web-favicon.png...
copy /Y "%SOURCE%\zst-icon-favicon.png" "%DEST%\app-icon-web-favicon.png"

echo.
echo ========================================
echo SUCCESS! All icons installed!
echo ========================================
echo.
echo Next steps:
echo 1. Clear cache: npx expo start --clear
echo 2. Rebuild app: npm run build:android:device
echo.
pause
