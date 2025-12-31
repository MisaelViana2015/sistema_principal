$ErrorActionPreference = "Stop"

# --- CONFIGURAÇÃO ---
$SourceDir = "C:\dev\SISTEMA_OFICIAL"
$DestDir1 = "C:\dev\Backups_Servidores\Automated"
$LogDir = "C:\dev\SISTEMA_OFICIAL\logs"
$LogFile = "$LogDir\backup_debug.log"

# Garantir diretório de logs
if (!(Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

function Log-Message {
    param([string]$Message, [string]$Color = "White", [string]$Type = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogLine = "[$Timestamp] [$Type] $Message"
    
    # Write to File
    Add-Content -Path $LogFile -Value $LogLine -Force
    
    # Write to Console (with mapping for simple colors)
    $ConsoleColor = switch ($Type) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        Default { "Cyan" }
    }
    Write-Host $LogLine -ForegroundColor $ConsoleColor
}

Log-Message "=== INICIANDO PROCESSO DE BACKUP (v2 Robust) ==="

# --- RESOLVING ONEDRIVE PATH ---
$OneDriveRoot = "E:\OneDrive"
$DesktopFolder = Get-ChildItem -Path $OneDriveRoot -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*rea de Trabalho" } | Select-Object -First 1

if ($DesktopFolder) {
    $DestDir2 = Join-Path $DesktopFolder.FullName "Misa e Isa\Sistemas Sun Up\Backups_Servidores"
    Log-Message "OneDrive Path Resolved: $DestDir2"
}
else {
    $DestDir2 = "E:\OneDrive\Área de Trabalho\Misa e Isa\Sistemas Sun Up\Backups_Servidores"
    Log-Message "Used Hardcoded Path: $DestDir2" "Yellow" "WARN"
}

$MaxBackups = 6

# Timestamp for folder name
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupName = "Backup_System_$Timestamp"

# --- 1. DB BACKUP STRATEGY ---
Log-Message "Iniciando backup de banco de dados..."
Set-Location "$SourceDir\server"
$EnvFile = "$SourceDir\server\.env"
$CredFile = "$SourceDir\server\db_prod.cred"
$DbUrlFound = $false

# Strategy A: Decrypt SecureString (Preferred)
if (Test-Path $CredFile) {
    try {
        Log-Message "Tentando decriptar credencial ($CredFile)..."
        $Encrypted = Get-Content $CredFile | ConvertTo-SecureString -ErrorAction Stop
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Encrypted)
        $UnsecurePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        $env:DATABASE_URL = $UnsecurePassword
        $DbUrlFound = $true
        Log-Message "Credencial carregada com sucesso via Decryption." "Green" "SUCCESS"
    }
    catch {
        Log-Message "Falha ao decriptar credencial (possivelmente usuário diferente): $($_.Exception.Message)" "Yellow" "WARN"
    }
}

# Strategy B: Read .env File (Fallback for SYSTEM user)
if (-not $DbUrlFound -and (Test-Path $EnvFile)) {
    try {
        Log-Message "Tentando ler DATABASE_URL direto do .env ($EnvFile)..."
        $Content = Get-Content $EnvFile
        foreach ($line in $Content) {
            if ($line -match "^DATABASE_URL=(.+)$") {
                $env:DATABASE_URL = $matches[1]
                $DbUrlFound = $true
                Log-Message "DATABASE_URL encontrada no .env." "Green" "SUCCESS"
                break
            }
        }
    }
    catch {
        Log-Message "Erro ao ler .env: $($_.Exception.Message)" "Red" "ERROR"
    }
}

if ($DbUrlFound) {
    try {
        # Capture output
        $Output = npm run db:backup 2>&1
        $ExitCode = $LASTEXITCODE
        
        if ($ExitCode -ne 0) {
            throw "npm run db:backup exited with code $ExitCode. Output: $Output"
        }
        Log-Message "Backup de banco executado com sucesso." "Green" "SUCCESS"
    }
    catch {
        Log-Message "FALHA CRÍTICA ao executar comando de backup: $_" "Red" "ERROR"
        # Continue to file backup even if DB fails
    }
    finally {
        $env:DATABASE_URL = "" # Clear from memory
    }
}
else {
    Log-Message "NENHUMA CREDENCIAL ENCONTRADA! Backup do banco será pulado." "Red" "ERROR"
}

# --- COPY FUNCTION ---
function Perform-Backup {
    param (
        [string]$DestinationRoot
    )

    if (-not $DestinationRoot) { return }

    $TargetFolder = Join-Path $DestinationRoot $BackupName

    if (!(Test-Path $DestinationRoot)) {
        try { New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null } catch { return }
    }

    Log-Message "Copiando arquivos para: $TargetFolder"

    $RoboArgs = @(
        $SourceDir,
        $TargetFolder,
        "/MIR",
        "/XD", "node_modules", ".git", ".next", "dist", ".gemini", "coverage", ".output",
        "/XF", "*.log",
        "/R:2", "/W:1",
        "/NFL", "/NDL" 
    )

    $RoboOutput = & robocopy @RoboArgs
    
    # Robocopy exit codes: 0-7 are success/warnings. 8+ are failures.
    if ($LASTEXITCODE -ge 8) {
        Log-Message "Erro critico no Robocopy para $DestinationRoot (Code: $LASTEXITCODE)" "Red" "ERROR"
    }
    else {
        Log-Message "Cópia finalizada com sucesso (Code: $LASTEXITCODE)." "Green" "SUCCESS"
    }

    # --- RETENTION ---
    Log-Message "Verificando retencao (Manter ultimos $MaxBackups)..."
    
    $CurrentBackups = Get-ChildItem -Path $DestinationRoot -Directory | Sort-Object CreationTimeDescending

    if ($CurrentBackups.Count -gt $MaxBackups) {
        $BackupsToDelete = $CurrentBackups | Select-Object -Skip $MaxBackups
        foreach ($Backup in $BackupsToDelete) {
            Log-Message "Removendo backup antigo: $($Backup.FullName)" "Yellow" "WARN"
            Remove-Item -Path $Backup.FullName -Recurse -Force
        }
    }
}

# --- EXECUTE ---
Perform-Backup -DestinationRoot $DestDir1

if ($DestDir2 -and (Test-Path $OneDriveRoot)) {
    Perform-Backup -DestinationRoot $DestDir2
}
else {
    Log-Message "Drive E: ou pasta do OneDrive nao encontrada." "Yellow" "WARN"
}

Log-Message "Processo de backup finalizado!" "Green" "SUCCESS"
