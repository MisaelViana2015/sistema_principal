$ErrorActionPreference = "Stop"

# --- SIMULAÇÃO DE AMBIENTE SYSTEM ---
Write-Host ">>> SIMULANDO FALHA DE CREDENCIAL..." -ForegroundColor Yellow

$SourceDir = "C:\dev\SISTEMA_OFICIAL"
$EnvFile = "$SourceDir\server\.env"

# Forçar falha (fingir que não tem cred)
$DbUrlFound = $false

# --- TESTE DA ESTRATÉGIA B (.env) ---
if (Test-Path $EnvFile) {
    try {
        Write-Host "Tentando ler DATABASE_URL direto do .env ($EnvFile)..." -ForegroundColor Cyan
        $Content = Get-Content $EnvFile
        foreach ($line in $Content) {
            if ($line -match "^DATABASE_URL=(.*)") {
                $env:DATABASE_URL = $matches[1]
                $DbUrlFound = $true
                Write-Host "DATABASE_URL encontrada: $($env:DATABASE_URL.Substring(0, 15))..." -ForegroundColor Green
                break
            }
        }
    }
    catch {
        Write-Error "Erro ao ler .env: $_"
    }
}

if ($DbUrlFound) {
    Write-Host ">>> EXECUTANDO NPM RUN DB:BACKUP..." -ForegroundColor Cyan
    Set-Location "$SourceDir\server"
    npm run db:backup
}
else {
    Write-Error "FALHA: Não encontrou URL no .env"
}
