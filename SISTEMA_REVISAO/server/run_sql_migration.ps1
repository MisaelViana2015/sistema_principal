$ErrorActionPreference = "Stop"

$SourceDir = "C:\dev\SISTEMA_OFICIAL\server"
$CredFile = "$SourceDir\db_prod.cred"

if (Test-Path $CredFile) {
    try {
        Write-Host ">>> Decriptando credenciais do banco..." -ForegroundColor Cyan
        $Encrypted = Get-Content $CredFile | ConvertTo-SecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Encrypted)
        $UnsecurePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        $env:PGPASSWORD = $UnsecurePassword
        Write-Host ">>> Credencial desbloqueada com sucesso." -ForegroundColor Green
    }
    catch {
        Write-Error "!!! Falha ao decriptar arquivo de credencial."
        exit 1
    }
}
else {
    Write-Error "!!! Arquivo de credencial nao encontrado: $CredFile"
    exit 1
}

$DB_Host = "junction.proxy.rlwy.net"
$DB_Port = "45952"
$DB_User = "postgres"
$DB_Name = "railway"

# Construct connection string for info, but use arguments for psql
$DB_URL = "postgresql://$($DB_User)@$($DB_Host):$($DB_Port)/$($DB_Name)"

Write-Host ">>> Aplicando SQL em: $DB_Host" -ForegroundColor Cyan

Set-Location $SourceDir

# Execute psql
# We pipe the file content to avoid weird path parsing issues if any
# -v ON_ERROR_STOP=1 ensures we know if it fails
Get-Content "migration.sql" | psql -h $DB_Host -p $DB_Port -U $DB_User -d $DB_Name -v ON_ERROR_STOP=1

if ($LASTEXITCODE -eq 0) {
    Write-Host ">>> SUCESSO! SQL Aplicado." -ForegroundColor Green
}
else {
    Write-Error "!!! FALHA ao aplicar SQL."
}

# Cleanup
$env:PGPASSWORD = ""
