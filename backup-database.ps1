# ============================================
# SCRIPT DE BACKUP AUTOMÁTICO DO BANCO DE DADOS
# ============================================
# Faz backup completo do PostgreSQL Railway
# Uso: .\backup-database.ps1

$ErrorActionPreference = "Stop"

# ========== CONFIGURAÇÕES (EDITE AQUI) ==========
$DATABASE_URL = "postgresql://postgres:SENHA@DOMINIO.railway.app:5432/railway"
# ================================================

$BACKUP_DIR = ".\backups"
$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\backup-rota-verde-$DATE.sql"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ROTA VERDE - BACKUP AUTOMÁTICO         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se pg_dump está instalado
try {
    $null = Get-Command pg_dump -ErrorAction Stop
} catch {
    Write-Host "❌ ERRO: pg_dump não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale PostgreSQL Client Tools:" -ForegroundColor Yellow
    Write-Host "  https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Criar diretório de backups
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "📁 Diretório de backups criado: $BACKUP_DIR" -ForegroundColor Green
}

Write-Host "🔄 Iniciando backup do banco de dados..." -ForegroundColor Cyan
Write-Host "🕐 Horário: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Fazer dump
try {
    pg_dump $DATABASE_URL > $BACKUP_FILE
    
    if ($LASTEXITCODE -eq 0) {
        $FileSize = (Get-Item $BACKUP_FILE).Length / 1MB
        Write-Host "✅ BACKUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 Arquivo: $BACKUP_FILE" -ForegroundColor Yellow
        Write-Host "📊 Tamanho: $([math]::Round($FileSize, 2)) MB" -ForegroundColor Yellow
        Write-Host "🕐 Concluído: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
        Write-Host ""
        
        # Listar todos os backups
        Write-Host "📋 Backups disponíveis:" -ForegroundColor Cyan
        Get-ChildItem $BACKUP_DIR -Filter "backup-rota-verde-*.sql" | 
            Sort-Object LastWriteTime -Descending |
            ForEach-Object {
                $size = $_.Length / 1MB
                Write-Host "   └─ $($_.Name) ($([math]::Round($size, 2)) MB)" -ForegroundColor Gray
            }
        Write-Host ""
    } else {
        throw "pg_dump retornou código de erro: $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ ERRO AO FAZER BACKUP!" -ForegroundColor Red
    Write-Host "Detalhes: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
