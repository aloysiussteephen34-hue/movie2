@echo off
setlocal
echo ====================================================================
echo        CineTrack - Push All 6 Commits to GitHub
echo        Repo: https://github.com/aloysiussteephen34-hue/movie2.git
echo ====================================================================
echo.
echo NOTE: GitHub requires a Personal Access Token (PAT) with "repo" scope.
echo If you don't have one, generate it at: https://github.com/settings/tokens
echo.
set /p TOKEN="Enter your GitHub Personal Access Token (PAT): "
if "%TOKEN%"=="" (
    echo [ERROR] No token entered. Exiting.
    pause
    exit /b 1
)

echo.
echo [1/2] Updating remote URL with token...
"C:\Users\annas\.gemini\antigravity\scratch\mingit\cmd\git.exe" remote set-url origin https://%TOKEN%@github.com/aloysiussteephen34-hue/movie2.git

echo [2/2] Pushing all commits to main branch...
"C:\Users\annas\.gemini\antigravity\scratch\mingit\cmd\git.exe" push -u origin main --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo [SUCCESS] Successfully pushed all commits to GitHub!
    echo Visit: https://github.com/aloysiussteephen34-hue/movie2
    echo ====================================================================
) else (
    echo.
    echo [ERROR] Push failed. Please check your token permissions.
)

pause
