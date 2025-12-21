
# Script para Configurar e Popular Banco de Produção
# Executar no PowerShell: ./tools/migrate_prod.ps1

$ErrorActionPreference = "Stop"
$ProdURL = "postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway"

Write-Host "=== MIGRACAO ROTA VERDE (TESTE -> PRODUCAO) ===" -ForegroundColor Cyan

# 1. Empurrar Schema (Criar Tabelas)
Write-Host "`n1. Criando tabelas no Banco de Produção..." -ForegroundColor Yellow
$env:DATABASE_URL = $ProdURL
cmd /c "npx drizzle-kit push:pg"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao criar tabelas. Verifique a conexão."
    exit $LASTEXITCODE
}

# 2. Sincronizar Dados
Write-Host "`n2. Sincronizando dados (Apagar Prod -> Importar Teste)..." -ForegroundColor Yellow
# Remover variavel para que o script leia o .env local (Banco de Teste)
Remove-Item Env:\DATABASE_URL
cmd /c "npx ts-node tools/sync-test-to-prod.ts"

Write-Host "`n=== PROCESSO FINALIZADO ===" -ForegroundColor Green
