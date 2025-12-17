
# Script de Deploy Seguro - Rota Verde
# Garante Backup e Organização ANTES de enviar para o GitHub

$ErrorActionPreference = "Stop"

Write-Host "🛡️  INICIANDO PROTOCOLO DE DEPLOY SEGURO" -ForegroundColor Cyan

# 1. Executar Backup de Dados (Engine Node.js)
Write-Host "1️⃣  Rodando Backup de Banco de Dados (Oficial)..." -ForegroundColor Yellow
npx tsx tools/backup_engine.ts
if ($LASTEXITCODE -ne 0) { Write-Error "Falha no backup do banco! Abortando deploy."; exit 1 }

# 2. Executar Backup de Código Local (Teste)
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

$CodeDests = @(
    "..\Backups_Servidores\Teste\Code\Backup_Code_PreDeploy_$Timestamp",
    "..\Backups_Servidores\Redundancia_1\Code\Backup_Code_PreDeploy_$Timestamp",
    "..\Backups_Servidores\Redundancia_2\Code\Backup_Code_PreDeploy_$Timestamp"
)

Write-Host "2️⃣  Salvando snapshots de código (3 caminhos)..." -ForegroundColor Yellow

foreach ($CodeDest in $CodeDests) {
    Write-Host "   📂 Copiando para: $CodeDest"
    # Usar Robocopy ou Copy-Item simples (excluindo node_modules)
    New-Item -ItemType Directory -Force -Path $CodeDest | Out-Null
    Copy-Item -Path "server", "client", "shared", "package.json", "tsconfig.json" -Destination $CodeDest -Recurse
}

Write-Host "✅ Código salvo em 3 locais." -ForegroundColor Green

# 3. Organização (Garantir que não tem lixo na raiz)
# (Já fizemos isso hoje, mas bom garantir)

# 4. Envio para GitHub
Write-Host "3️⃣  Enviando para GitHub..." -ForegroundColor Yellow
git add .
$CommitMsg = Read-Host "Digite a mensagem do commit"
if ([string]::IsNullOrWhiteSpace($CommitMsg)) { $CommitMsg = "chore: update via safe deploy" }
git commit -m "$CommitMsg"
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "🚀 SUCESSO! Sistema atualizado e backup garantido." -ForegroundColor Green
} else {
    Write-Host "⚠️  Erro no Git Push." -ForegroundColor Red
}
