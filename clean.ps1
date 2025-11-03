# DevQuest Monorepo Cleanup Script (PowerShell)
Write-Host "Cleaning DevQuest monorepo..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Removing node_modules directories..." -ForegroundColor Yellow
$dirs = @("node_modules", "frontend\node_modules", "backend\node_modules", "contracts\node_modules", "shared\node_modules")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "  Removed $dir" -ForegroundColor Green
    }
}

Write-Host "Removing build directories..." -ForegroundColor Yellow
$buildDirs = @("frontend\.next", "backend\dist", "contracts\artifacts", "contracts\cache", "shared\dist")
foreach ($dir in $buildDirs) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "  Removed $dir" -ForegroundColor Green
    }
}

Write-Host "Removing lock files..." -ForegroundColor Yellow
$lockFiles = @("bun.lockb", "frontend\bun.lockb", "backend\bun.lockb", "contracts\bun.lockb")
foreach ($file in $lockFiles) {
    if (Test-Path $file) {
        Remove-Item -Force $file
        Write-Host "  Removed $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Clean complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Run 'bun install' to reinstall dependencies." -ForegroundColor Cyan
