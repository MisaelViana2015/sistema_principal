
# Script de Backup Automático de Banco de Dados (Windows/PowerShell)
# Local: /tools/backup/backup_db.ps1

$ErrorActionPreference = "Stop"

# Carregar variáveis de ambiente simples (se .env existir)
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^DATABASE_URL=(.*)") {
            $env:DATABASE_URL = $matches[1]
        }
    }
}

# Configurações
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$ProjectName = "rota-verde"
$TargetDir = Resolve-Path "..\..\Backups_Servidores\Database"
$DumpName = "${ProjectName}_${Timestamp}.dump"
$DumpPath = Join-Path $TargetDir $DumpName

# Limite de retenção (Manter últimos 7)
$RetentionCount = 7

Write-Host "--- INICIANDO BACKUP DE BANCO DE DADOS ---" -ForegroundColor Cyan

# Verificações
if (-not $env:DATABASE_URL) {
    Write-Error "ERRO: DATABASE_URL não encontrada. Certifique-se de executar na raiz onde está o .env"
    exit 1
}

# Verificar se pg_dump está no PATH
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Warning "AVISO: 'pg_dump' não encontrado no PATH."
    Write-Warning "Tentando caminhos comuns do PostgreSQL..."
    # Tenta adicionar caminho padrão do Postgres 15/16/17 se existir
    $PossiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin",
        "C:\Program Files\PostgreSQL\15\bin",
        "C:\Program Files\PostgreSQL\14\bin"
    )
    foreach ($P in $PossiblePaths) {
        if (Test-Path $P) {
            $env:Path += ";$P"
            Write-Host "Adicionado ao PATH: $P" -ForegroundColor Green
            break
        }
    }
}

# 1. Garantir diretório
if (!(Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

# 2. Executar Dump
Write-Host "Executando pg_dump..." -ForegroundColor Yellow
try {
    # Formato Custom (-Fc) é melhor para pg_restore, mas SQL Plain é mais legível. 
    # Vamos usar Plain SQL (--clean --if-exists) para garantir compatibilidade máxima como pedido.
    pg_dump "$env:DATABASE_URL" --clean --if-exists --no-owner --no-acl --file "$DumpPath"
    
    if (Test-Path $DumpPath) {
        $Size = (Get-Item $DumpPath).Length / 1KB
        Write-Host "Dump criado com sucesso: $DumpPath ({0:N2} KB)" -f $Size -ForegroundColor Green
    }
    else {
        throw "Arquivo de dump não foi criado."
    }
}
catch {
    Write-Error "FALHA ao executar pg_dump: $_"
    exit 1
}

# 3. Limpeza de Antigos
$OldFiles = Get-ChildItem -Path $TargetDir -Filter "*.dump" | Sort-Object CreationTime -Descending | Select-Object -Skip $RetentionCount
if ($OldFiles) {
    Write-Host "Removendo dumps antigos..." -ForegroundColor Yellow
    foreach ($File in $OldFiles) {
        Remove-Item $File.FullName -Force
        Write-Host "Removido: $($File.Name)" -ForegroundColor DarkGray
    }
}

Write-Host "--- FIM DO PROCESSO ---" -ForegroundColor Cyan
