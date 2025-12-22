# ============================================
# SCRIPT DE RESTORE AUTOMÁTICO DE BACKUP
# ============================================
# Restaura backup no banco de dados
# Uso: .\restore-backup.ps1 -DatabaseURL "postgresql://..." -BackupFile ".\backups\backup-xxx.sql"

param(
    [Parameter(Mandatory=$true, HelpMessage="Connection string do banco (postgresql://...)")]
    [string]$DatabaseURL,
    
    [Parameter(Mandatory=$true, HelpMessage="Caminho para arquivo .sql do backup")]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  ROTA VERDE - RESTORE DE BACKUP         ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Verificar se psql está instalado
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "❌ ERRO: psql não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale PostgreSQL Client Tools:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Verificar se arquivo existe
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ ERRO: Arquivo de backup não encontrado!" -ForegroundColor Red
    Write-Host "Caminho especificado: $BackupFile" -ForegroundColor Red
    Write-Host ""
    
    # Listar backups disponíveis
    if (Test-Path ".\backups") {
        Write-Host "💡 Backups disponíveis em .\backups:" -ForegroundColor Yellow
        Get-ChildItem ".\backups" -Filter "*.sql" | ForEach-Object {
            Write-Host "   └─ $($_.Name)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    exit 1
}

# Mostrar informações
$FileSize = (Get-Item $BackupFile).Length / 1MB
Write-Host "📁 Arquivo de backup: $BackupFile" -ForegroundColor Cyan
Write-Host "📊 Tamanho: $([math]::Round($FileSize, 2)) MB" -ForegroundColor Cyan
Write-Host "🗄️  Banco de destino: $($DatabaseURL.Split('@')[1].Split('/')[0])" -ForegroundColor Cyan
Write-Host ""

# Confirmação
Write-Host "⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER todos os dados no banco!" -ForegroundColor Yellow
$confirm = Read-Host "Digite 'SIM' para confirmar"

if ($confirm -ne "SIM") {
    Write-Host "❌ Operação cancelada pelo usuário." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Iniciando restore..." -ForegroundColor Cyan
Write-Host "🕐 Horário: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Executar restore
try {
    psql $DatabaseURL < $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ RESTORE CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
        Write-Host "🕐 Finalizado: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
        Write-Host ""
        
        # Verificar dados
        Write-Host "🔍 Verificando dados restaurados..." -ForegroundColor Cyan
        $Query = "SELECT 'users' as tabela, COUNT(*) as total FROM users UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles UNION ALL SELECT 'shifts', COUNT(*) FROM shifts;"
        psql $DatabaseURL -c $Query
        Write-Host ""
    } else {
        throw "psql retornou código de erro: $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ ERRO AO RESTAURAR BACKUP!" -ForegroundColor Red
    Write-Host "Detalhes: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
