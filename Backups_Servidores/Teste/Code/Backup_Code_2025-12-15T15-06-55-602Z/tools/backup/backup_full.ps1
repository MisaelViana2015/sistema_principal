
# Rota Verde - Backup Script

$ErrorActionPreference = "Continue"

# Define Root como 2 niveis acima da pasta do script
$ScriptDir = $PSScriptRoot
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location -Path $ProjectRoot

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "[$Timestamp] STARTING FULL BACKUP" -ForegroundColor Cyan
Write-Host "WorkDir: $(Get-Location)"

# 1. DB Backup
Write-Host "[$Timestamp] 1. Starting DB Backup..." -ForegroundColor Cyan
try {
    # Executa usando caminho relativo da raiz
    powershell -ExecutionPolicy Bypass -File "tools\backup\backup_db.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$Timestamp] DB Backup: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "[$Timestamp] DB Backup: FAILED (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    }
}
catch {
    Write-Host "[$Timestamp] DB Backup: CRITICAL ERROR $_" -ForegroundColor Red
}

# 2. Code Backup
Write-Host "[$Timestamp] 2. Starting Code Backup..." -ForegroundColor Cyan
try {
    powershell -ExecutionPolicy Bypass -File "tools\backup\backup_code.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$Timestamp] Code Backup: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "[$Timestamp] Code Backup: FAILED (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    }
}
catch {
    Write-Host "[$Timestamp] Code Backup: CRITICAL ERROR $_" -ForegroundColor Red
}

# 3. GitHub Sync
Write-Host "[$Timestamp] 3. Syncing with GitHub..." -ForegroundColor Cyan
try {
    $GitStatus = git status --porcelain
    if ($GitStatus) {
        Write-Host "   Changes detected. Committing..."
        git add .
        git commit -m "backup(auto): automatic routine $Timestamp"
        git push origin main
        Write-Host "[$Timestamp] GitHub: Pushed successfully" -ForegroundColor Green
    } else {
        Write-Host "   Clean directory. Trying simple push..."
        git push origin main
        Write-Host "[$Timestamp] GitHub: Synced" -ForegroundColor Green
    }
}
catch {
    Write-Host "[$Timestamp] GitHub: Sync FAILED" -ForegroundColor Red
}

Write-Host "[$Timestamp] FINISHED" -ForegroundColor Cyan
