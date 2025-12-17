
# Script de Restauração de Banco de Dados (Manual/Emergência)
# Local: /tools/backup/restore_db.ps1
# Padrão Sistema Rota Verde - Seção 16.3 (Script C)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# Configurações
$BackupDir = Resolve-Path "..\..\..\Backups_Servidores\Database"

Write-Host "=== RESTAURAÇÃO DE BANCO DE DADOS (EMERGÊNCIA) ===" -ForegroundColor Red
Write-Host "AVISO: Isso irá SOBRESCREVER o banco de dados atual configurado no .env" -ForegroundColor Yellow
Write-Host "Diretório de Backups: $BackupDir"

# 1. Listar Backups Disponíveis
$Dumps = Get-ChildItem -Path $BackupDir -Filter "*.dump" | Sort-Object CreationTime -Descending

if ($Dumps.Count -eq 0) {
    Write-Error "Nenhum arquivo .dump encontrado no diretório de backups."
    exit 1
}

Write-Host "`nBackups disponíveis:" -ForegroundColor Cyan
for ($i = 0; $i -lt $Dumps.Count; $i++) {
    Write-Host "[$i] $($Dumps[$i].Name)  ($($Dumps[$i].CreationTime))"
}

# 2. Selecionar Backup
$Selection = Read-Host "`nDigite o número do backup para restaurar (0 a $($Dumps.Count - 1))"

if ($Selection -notmatch "^\d+$" -or [int]$Selection -ge $Dumps.Count) {
    Write-Error "Seleção inválida."
    exit 1
}

$SelectedDump = $Dumps[[int]$Selection]
$DumpPath = $SelectedDump.FullName

Write-Host "`nVocê selecionou: $($SelectedDump.Name)" -ForegroundColor Yellow
$Confirmation = Read-Host "Tem certeza ABSOLUTA? Digite 'CONFIRMAR' para prosseguir"

if ($Confirmation -ne "CONFIRMAR") {
    Write-Host "Operação cancelada."
    exit 0
}

# 3. Obter URL do Banco
# Tenta ler do .env local (dois níveis acima)
$EnvPath = Resolve-Path "..\..\.env"
$DatabaseUrl = $null

if (Test-Path $EnvPath) {
    Get-Content $EnvPath | ForEach-Object {
        if ($_ -match "^DATABASE_URL=(.*)") {
            $DatabaseUrl = $matches[1]
        }
    }
}

if (-not $DatabaseUrl) {
    $DatabaseUrl = Read-Host "DATABASE_URL não encontrada no .env. Cole a URL de conexão aqui"
}

if (-not $DatabaseUrl) {
    Write-Error "Sem DATABASE_URL. Abortando."
    exit 1
}

# 4. Executar Restore
Write-Host "`nRestaurando banco... (Aguarde)" -ForegroundColor Magenta

try {
    # Usando psql para restaurar script SQL plain (formato usado no backup_db.ps1)
    # Se fosse format custom (-Fc), usaria pg_restore
    
    # O comando abaixo assume que psql está no PATH. 
    # Adicionando caminhos comuns do Postgres se necessário (similar ao backup_db.ps1)
    $PossiblePaths = @("C:\Program Files\PostgreSQL\16\bin", "C:\Program Files\PostgreSQL\15\bin")
    foreach ($P in $PossiblePaths) { if (Test-Path $P) { $env:Path += ";$P"; break } }

    # Executa psql
    # -d URL
    # -f Arquivo
    cmd /c "psql `"$DatabaseUrl`" -f `"$DumpPath`""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
    } else {
        Write-Error "O comando psql retornou erro ($LASTEXITCODE)."
    }
}
catch {
    Write-Error "Falha na execução: $_"
}
