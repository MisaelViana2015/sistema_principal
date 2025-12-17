
# Script de Backup Automático de Código (Windows/PowerShell)
# Local: /tools/backup/backup_code.ps1

$ErrorActionPreference = "Stop"

# Configurações
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$ProjectName = "rota-verde"
$Ambiente = "TESTE" # Mudar para OFICIAL no servidor oficial
$SourceDir = Get-Location
$BackupRootDir = Resolve-Path "..\..\Backups_Servidores\Code"
$TargetDir = Join-Path $BackupRootDir $Ambiente
$ZipName = "${ProjectName}_${Ambiente}_${Timestamp}.zip"
$ZipPath = Join-Path $TargetDir $ZipName

# Limite de retenção (Manter últimos 3)
$RetentionCount = 3

Write-Host "--- INICIANDO BACKUP DE CÓDIGO ($Ambiente) ---" -ForegroundColor Cyan
Write-Host "Origem: $SourceDir"
Write-Host "Destino: $ZipPath"

# 1. Garantir que diretório existe
if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

# 2. Executar Compressão (Excluindo node_modules e .git para agilidade)
Write-Host "Compactando arquivos... (pode demorar)" -ForegroundColor Yellow
$Excludes = @("node_modules", ".git", "dist", ".cache", "logs")

# Usando 7zip se disponível ou Compress-Archive nativo
# Para simplicidade e compatibilidade nativa:
Compress-Archive -Path "$SourceDir\*" -DestinationPath $ZipPath -CompressionLevel Optimal -Force

Write-Host "Backup criado com sucesso: $ZipPath" -ForegroundColor Green

# 3. Limpeza de Antigos
$OldFiles = Get-ChildItem -Path $TargetDir -Filter "*.zip" | Sort-Object CreationTime -Descending | Select-Object -Skip $RetentionCount
if ($OldFiles) {
    Write-Host "Removendo backups antigos..." -ForegroundColor Yellow
    foreach ($File in $OldFiles) {
        Remove-Item $File.FullName -Force
        Write-Host "Removido: $($File.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "--- FIM DO PROCESSO ---" -ForegroundColor Cyan
