# CineTrack (MERN) - One-Click GitHub Push
param(
    [string]$Token
)

$gitExe = "C:\Users\annas\.gemini\antigravity\scratch\mingit\cmd\git.exe"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "       CineTrack - Push All 6 Commits to GitHub" -ForegroundColor Green
Write-Host "       Repo: https://github.com/aloysiussteephen34-hue/movie2.git" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $Token) {
    Write-Host "NOTE: GitHub requires a Personal Access Token (PAT) with 'repo' scope." -ForegroundColor Yellow
    Write-Host "Generate token: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
    $Token = Read-Host "Please enter your GitHub Personal Access Token (PAT)"
}

if (-not $Token) {
    Write-Host "[ERROR] Token cannot be empty." -ForegroundColor Red
    exit 1
}

Write-Host "[1/2] Updating remote URL with token..." -ForegroundColor Green
& $gitExe remote set-url origin "https://${Token}@github.com/aloysiussteephen34-hue/movie2.git"

Write-Host "[2/2] Pushing all commits to main branch..." -ForegroundColor Green
& $gitExe push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Repository successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Check your repository at: https://github.com/aloysiussteephen34-hue/movie2" -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to push to GitHub. Verify your token has 'repo' scope." -ForegroundColor Red
}

