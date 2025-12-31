
# Script de Backup Completo (Código + Dados)
$ErrorActionPreference = "Stop"

# Configurações
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$ProjectName = "rota-verde"
$Ambiente = "OFICIAL"
$SourceDir = "C:\dev\SISTEMA_OFICIAL"
$BackupRootDir = "C:\Backups_Servidores\Code" 
$TargetDir = Join-Path $BackupRootDir $Ambiente
$ZipName = "${ProjectName}_FULL_${Ambiente}_${Timestamp}.zip"
$ZipPath = Join-Path $TargetDir $ZipName

# Configurar diretório de destino
if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

Write-Host "--- INICIANDO BACKUP COMPLETO ---" -ForegroundColor Cyan

# 1. Executar Backup de DADOS (JSON Dump via Engine existente)
Write-Host "1. Exportando Dados (JSON)..." -ForegroundColor Yellow
Set-Location $SourceDir
try {
    # Executa o script TypeScript existente que já faz o dump
    cmd /c "npx tsx tools/backup_engine.ts"
}
catch {
    Write-Host "Erro ao exportar dados: $_" -ForegroundColor Red
}

# 2. Executar Backup de CÓDIGO (Zip)
Write-Host "2. Compactando Código-Fonte..." -ForegroundColor Yellow

# Lista de exclusões (arquivos temporários para o zip)
$Excludes = @("node_modules", ".git", "dist", ".vite", "logs", "coverage")

# Usando .NET ZipFile para contornar limitações e erros de sintaxe do Compress-Archive com exclusões complexas
# Método simplificado: Copiar para temp, excluir indesejados, zipar temp.

$TempDir = Join-Path $Env:TEMP "Backup_${ProjectName}_${Timestamp}"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

Write-Host "   - Copiando arquivos para área temporária..." -ForegroundColor DarkGray
# Robocopy é mais robusto para exclusão
$LogFile = Join-Path $Env:TEMP "robocopy.log"
robocopy $SourceDir $TempDir /E /XD $Excludes /XF *.log *.lock /NFL /NDL /NJH /NJS > $LogFile

Write-Host "   - Gerando arquivo ZIP..." -ForegroundColor DarkGray
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -CompressionLevel Optimal -Force

# Limpeza
Remove-Item -Recurse -Force $TempDir
Remove-Item -Force $LogFile

Write-Host "✅ Backup Completo Gerado: $ZipPath" -ForegroundColor Green
Write-Host "--- FIM DO PROCESSO ---" -ForegroundColor Cyan
