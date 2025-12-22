# ============================================
# SCRIPT DE DEPLOY COMPLETO AUTOMATIZADO
# ============================================
# Prepara e roda o sistema Rota Verde do zero
# Uso: .\deploy-completo.ps1 -DatabaseURL "postgresql://..." [-JWTSecret "chave"]

param(
    [Parameter(Mandatory=$true, HelpMessage="Connection string do banco PostgreSQL")]
    [string]$DatabaseURL,
    
    [Parameter(Mandatory=$false, HelpMessage="Chave secreta JWT (será gerada se omitida)")]
    [string]$JWTSecret = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  ROTA VERDE - DEPLOY AUTOMATIZADO       ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Gerar JWT_SECRET se não fornecido
if ([string]::IsNullOrEmpty($JWTSecret)) {
    $JWTSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "🔑 JWT_SECRET gerado automaticamente" -ForegroundColor Yellow
}

# Navegar para pasta do projeto
$PROJECT_DIR = "Chama Enterprise2025\SISTEMA_OFICIAL"
if (-not (Test-Path $PROJECT_DIR)) {
    Write-Host "❌ ERRO: Pasta do projeto não encontrada!" -ForegroundColor Red
    Write-Host "Execute este script na raiz do repositório rota-verde-railway" -ForegroundColor Yellow
    exit 1
}

Set-Location $PROJECT_DIR
Write-Host "📁 Diretório: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# ========== ETAPA 1: LIMPAR BUILD ANTERIOR ==========
Write-Host "🧹 [1/6] Limpando builds anteriores..." -ForegroundColor Cyan
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue "server\dist", "client\dist"
Write-Host "   ✓ Limpeza concluída" -ForegroundColor Green
Write-Host ""

# ========== ETAPA 2: INSTALAR DEPENDÊNCIAS ==========
Write-Host "📦 [2/6] Instalando dependências..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray

$StartTime = Get-Date
npm install --silent
$InstallTime = ((Get-Date) - $StartTime).TotalSeconds

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Falha ao instalar dependências!" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Dependências instaladas ($([math]::Round($InstallTime, 1))s)" -ForegroundColor Green
Write-Host ""

# ========== ETAPA 3: CRIAR ARQUIVO .ENV ==========
Write-Host "🔧 [3/6] Configurando variáveis de ambiente..." -ForegroundColor Cyan

$EnvContent = @"
# Configuração gerada automaticamente em $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
DATABASE_URL=$DatabaseURL
JWT_SECRET=$JWTSecret
NODE_ENV=production
PORT=5000
CORS_ORIGIN=*
"@

$EnvContent | Out-File -FilePath "server\.env" -Encoding UTF8 -NoNewline
Write-Host "   ✓ Arquivo .env criado" -ForegroundColor Green
Write-Host ""

# ========== ETAPA 4: BUILD DO PROJETO ==========
Write-Host "🔨 [4/6] Compilando projeto..." -ForegroundColor Cyan
Write-Host "   (Isso pode levar alguns minutos...)" -ForegroundColor Gray

$StartTime = Get-Date
npm run build
$BuildTime = ((Get-Date) - $StartTime).TotalSeconds

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Falha no build!" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Build concluído ($([math]::Round($BuildTime, 1))s)" -ForegroundColor Green
Write-Host ""

# ========== ETAPA 5: TESTAR CONEXÃO COM BANCO ==========
Write-Host "🔍 [5/6] Testando conexão com banco de dados..." -ForegroundColor Cyan

$TestScript = @"
require('dotenv').config({ path: './server/.env' });
const { testConnection } = require('./server/dist/core/db/connection.js');
testConnection().then(result => {
    if (result) {
        console.log('   ✓ Conexão estabelecida');
        process.exit(0);
    } else {
        console.log('   ❌ Falha na conexão');
        process.exit(1);
    }
}).catch(err => {
    console.error('   ❌ Erro:', err.message);
    process.exit(1);
});
"@

$TestScript | Out-File -FilePath "test-db.js" -Encoding UTF8
node test-db.js

if ($LASTEXITCODE -ne 0) {
    Remove-Item test-db.js
    Write-Host ""
    Write-Host "❌ Erro ao conectar no banco de dados!" -ForegroundColor Red
    Write-Host "Verifique se a DATABASE_URL está correta." -ForegroundColor Yellow
    exit 1
}

Remove-Item test-db.js
Write-Host "   ✓ Banco de dados acessível" -ForegroundColor Green
Write-Host ""

# ========== ETAPA 6: RESUMO FINAL ==========
Write-Host "🎉 [6/6] DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         SISTEMA PRONTO PARA USO          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1️⃣  Iniciar servidor:" -ForegroundColor Yellow
Write-Host "      npm start" -ForegroundColor White
Write-Host ""
Write-Host "   2️⃣  Acessar no navegador:" -ForegroundColor Yellow
Write-Host "      http://localhost:5000/login" -ForegroundColor White
Write-Host ""
Write-Host "   3️⃣  Restaurar backup (se necessário):" -ForegroundColor Yellow
Write-Host "      ..\..\..\restore-backup.ps1 -DatabaseURL '$DatabaseURL' -BackupFile '.\backups\backup-xxx.sql'" -ForegroundColor White
Write-Host ""

Write-Host "📋 INFORMAÇÕES:" -ForegroundColor Cyan
Write-Host "   └─ Arquivo de configuração: server\.env" -ForegroundColor Gray
Write-Host "   └─ JWT Secret: $($JWTSecret.Substring(0, 10))..." -ForegroundColor Gray
Write-Host "   └─ Banco: $($DatabaseURL.Split('@')[1].Split('/')[0])" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Tudo pronto! Boa sorte! 🚀" -ForegroundColor Green
Write-Host ""
