#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Security Gate - Verificações de segurança antes do deploy.
.DESCRIPTION
  Valida padrões de segurança do código antes de permitir deploy.
  Executar no CI/CD e localmente.
.NOTES
  Exit 0 = OK
  Exit 1 = Falhou
#>

$ErrorActionPreference = "Stop"
$global:failures = 0

function Write-Check {
    param([string]$Name, [bool]$Passed, [string]$Details = "")
    if ($Passed) {
        Write-Host "✅ PASS: $Name" -ForegroundColor Green
    }
    else {
        Write-Host "❌ FAIL: $Name" -ForegroundColor Red
        if ($Details) { Write-Host "   $Details" -ForegroundColor Yellow }
        $global:failures++
    }
}

function Get-FileText {
    param([string]$Path)
    return (Get-Content $Path -Raw -ErrorAction Stop)
}

function Find-RouterWriteBlocks {
    param([string]$Content)
    # Captura blocos router.post/put/delete(...) multi-linha até o fechamento ");"
    $pattern = '(?ms)router\.(post|put|delete)\s*\((.*?)\);\s*'
    return [regex]::Matches($Content, $pattern)
}

Write-Host "`n=== 🔐 SECURITY GATE - Rota Verde ===`n" -ForegroundColor Cyan

# Detectar root do repositório (relativo ao script ou CWD)
$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

# Subir um nível se estivermos em tools/
if ($scriptDir -match 'tools$') {
    $repoRoot = Split-Path $scriptDir -Parent
}
else {
    $repoRoot = $scriptDir
}

$routesRoot = Join-Path $repoRoot "server\modules"

Write-Host "📁 Repo Root: $repoRoot" -ForegroundColor Gray
Write-Host "📁 Routes Root: $routesRoot`n" -ForegroundColor Gray

# ----- CHECK 1: Rotas de escrita sem requireAuth -----
Write-Host "🔍 Verificando rotas de escrita sem requireAuth..." -ForegroundColor Gray

$problematicRoutes = New-Object System.Collections.Generic.List[string]

Get-ChildItem -Path $routesRoot -Filter "*.routes.ts" -Recurse -ErrorAction Stop | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-FileText $filePath

    # Se o arquivo tem router.use(requireAuth...) global, todas as rotas estão protegidas
    $hasGlobalAuth = $content -match 'router\.use\s*\([^)]*requireAuth'
    if ($hasGlobalAuth) { return } # Skip this file, it's globally protected

    $regexMatches = Find-RouterWriteBlocks -Content $content

    foreach ($m in $regexMatches) {
        $method = $m.Groups[1].Value
        $argsBlock = $m.Groups[2].Value

        # Rotas públicas permitidas (por padrão, mínimo)
        $isExplicitPublic =
        ($filePath -match "auth\.routes\.ts") -and (
            $argsBlock -match '"/login"' -or
            $argsBlock -match '"/refresh"' -or
            $argsBlock -match '"/change-password-required"'
        )

        if ($isExplicitPublic) { continue }

        $hasRequireAuth = $argsBlock -match 'requireAuth'
        if (-not $hasRequireAuth) {
            $snippet = $argsBlock.Trim()
            if ($snippet.Length -gt 140) { $snippet = $snippet.Substring(0, 140) + "..." }
            $problematicRoutes.Add("$($_.Name) [$method] :: $snippet")
        }
    }
}

Write-Check `
    -Name "Todas as rotas de escrita possuem requireAuth (exceto públicas explícitas)" `
    -Passed ($problematicRoutes.Count -eq 0) `
    -Details ($problematicRoutes -join " | ")

# ----- CHECK 2: Operações financeiras com auditLog -----
Write-Host "🔍 Verificando auditLog em rotas financeiras..." -ForegroundColor Gray
$financialRoutesPath = Join-Path $repoRoot "server\modules\financial\financial.routes.ts"

if (Test-Path $financialRoutesPath) {
    $financialRoutes = Get-FileText $financialRoutesPath
    $blocks = Find-RouterWriteBlocks -Content $financialRoutes

    $expenseBlockOk = $false
    foreach ($b in $blocks) {
        $argsBlock = $b.Groups[2].Value
        # Checa a presença de "/expenses" + auditLog no mesmo bloco
        if ($argsBlock -match '"/expenses"' -and $argsBlock -match 'auditLog') {
            $expenseBlockOk = $true
            break
        }
    }

    Write-Check -Name "POST /expenses possui auditLog" -Passed $expenseBlockOk
}
else {
    Write-Check -Name "POST /expenses possui auditLog" -Passed $false -Details "Arquivo não encontrado: $financialRoutesPath"
}

# ----- CHECK 3: Limite de payload configurado -----
Write-Host "🔍 Verificando limite de payload..." -ForegroundColor Gray
$appPathCandidates = @(
    (Join-Path $repoRoot "server\app.ts"),
    (Join-Path $repoRoot "server\index.ts")
)

$hasPayloadLimit = $false
$payloadWhere = ""

foreach ($p in $appPathCandidates) {
    if (Test-Path $p) {
        $txt = Get-FileText $p
        if ($txt -match 'express\.json\s*\(\s*\{\s*limit\s*:\s*["'']') {
            $hasPayloadLimit = $true
            $payloadWhere = (Split-Path $p -Leaf)
            break
        }
    }
}

Write-Check -Name "Limite de payload JSON configurado" -Passed $hasPayloadLimit -Details $payloadWhere

# ----- CHECK 4: Campos monetários com min positivo (.min(0.01)) -----
Write-Host "🔍 Verificando validação de valores monetários..." -ForegroundColor Gray
$financialValidatorsPath = Join-Path $repoRoot "server\modules\financial\financial.validators.ts"

if (Test-Path $financialValidatorsPath) {
    $validators = Get-FileText $financialValidatorsPath
    # Espera min >= 0.01 para dinheiro
    $hasMoneyMin = $validators -match '\.min\s*\(\s*0\.0?1'
    Write-Check -Name "Campos monetários possuem validação .min(0.01)" -Passed $hasMoneyMin
}
else {
    Write-Check -Name "Campos monetários possuem validação .min(0.01)" -Passed $false -Details "Arquivo não encontrado: $financialValidatorsPath"
}

# ----- CHECK 5: authMiddleware bloqueia usuários inativos com 401/403 -----
Write-Host "🔍 Verificando bloqueio de usuários inativos..." -ForegroundColor Gray
$authMiddlewarePath = Join-Path $repoRoot "server\core\middlewares\authMiddleware.ts"

if (Test-Path $authMiddlewarePath) {
    $auth = Get-FileText $authMiddlewarePath
    $hasActiveCheck =
    ($auth -match 'isActive') -and
    ($auth -match 'UnauthorizedError|401|403') -and
    ($auth -match 'desativado|inativo|inactive')
    Write-Check -Name "authMiddleware verifica isActive e bloqueia" -Passed $hasActiveCheck
}
else {
    Write-Check -Name "authMiddleware verifica isActive e bloqueia" -Passed $false -Details "Arquivo não encontrado: $authMiddlewarePath"
}

# ----- RESULTADO FINAL -----
Write-Host "`n=== RESULTADO ===" -ForegroundColor Cyan
if ($global:failures -eq 0) {
    Write-Host "🎉 Todas as verificações passaram! Deploy liberado." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "⛔ $($global:failures) verificação(ões) falharam. Deploy BLOQUEADO." -ForegroundColor Red
    exit 1
}
