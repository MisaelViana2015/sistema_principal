$ErrorActionPreference = "Stop"

# --- CONFIGURAÇÃO ---
$SourceDir = "C:\dev\SISTEMA_OFICIAL"
$DestDir1 = "C:\dev\Backups_Servidores\Automated"

# --- RESOLVING ONEDRIVE PATH ---
$OneDriveRoot = "E:\OneDrive"
$DesktopFolder = Get-ChildItem -Path $OneDriveRoot -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*rea de Trabalho" } | Select-Object -First 1

if ($DesktopFolder) {
    $DestDir2 = Join-Path $DesktopFolder.FullName "Misa e Isa\Sistemas Sun Up\Backups_Servidores"
    Write-Host ">>> OneDrive Path Resolved: $DestDir2" -ForegroundColor Cyan
}
else {
    $DestDir2 = "E:\OneDrive\Área de Trabalho\Misa e Isa\Sistemas Sun Up\Backups_Servidores"
    Write-Host ">>> Used Hardcoded Path: $DestDir2" -ForegroundColor Cyan
}

$MaxBackups = 6

# Timestamp for folder name
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupName = "Backup_System_$Timestamp"

# --- 1. DB BACKUP (SECURE MODE) ---
Write-Host ">>> Decriptando credenciais do banco..." -ForegroundColor Cyan
$CredFile = "$SourceDir\server\db_prod.cred"

if (Test-Path $CredFile) {
    try {
        # Decrypt SecureString
        $Encrypted = Get-Content $CredFile | ConvertTo-SecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Encrypted)
        $UnsecurePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        
        # Set Environment Variable for the backup process
        $env:DATABASE_URL = $UnsecurePassword
        
        Write-Host ">>> Credencial carregada com seguranca." -ForegroundColor Green
    }
    catch {
        Write-Error "!!! Falha ao decriptar arquivo de credencial."
    }
}
else {
    Write-Warning "!!! Arquivo de credencial nao encontrado: $CredFile"
}

Write-Host ">>> Gerando backup do banco de dados..." -ForegroundColor Cyan
Set-Location "$SourceDir\server"
try {
    # Notice: No need for .env.backup anymore, uses env var
    npm run db:backup
}
catch {
    Write-Warning "!!! Falha ao gerar backup do banco."
}
finally {
    # Clear secret from memory/env
    $env:DATABASE_URL = ""
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

    Write-Host ">>> Copiando arquivos para: $TargetFolder" -ForegroundColor Green

    $RoboArgs = @(
        $SourceDir,
        $TargetFolder,
        "/MIR",
        "/XD", "node_modules", ".git", ".next", "dist", ".gemini", "coverage", ".output",
        "/XF", "*.log",
        "/R:2", "/W:1",
        "/NFL", "/NDL" 
    )

    & robocopy @RoboArgs
    if ($LASTEXITCODE -ge 8) {
        Write-Error "!!! Erro critico no Robocopy para $DestinationRoot"
    }

    # --- RETENTION ---
    Write-Host ">>> Verificando retencao (Manter ultimos $MaxBackups)..." -ForegroundColor Yellow
    
    $CurrentBackups = Get-ChildItem -Path $DestinationRoot -Directory | Sort-Object CreationTimeDescending

    if ($CurrentBackups.Count -gt $MaxBackups) {
        $BackupsToDelete = $CurrentBackups | Select-Object -Skip $MaxBackups
        foreach ($Backup in $BackupsToDelete) {
            Write-Host "--- Removendo backup antigo: $($Backup.FullName)" -ForegroundColor Red
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
    Write-Warning "!!! Drive E: ou pasta do OneDrive nao encontrada."
}

Write-Host ">>> Processo de backup finalizado!" -ForegroundColor Green
