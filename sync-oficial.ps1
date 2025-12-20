# ==============================================================================
# Script de Sincronização: SISTEMA_OFICIAL → Servidor-Producao
# ==============================================================================
# 
# Propósito: Sincronizar código do sistema oficial para produção
# Uso: .\sync-oficial.ps1
# Autor: Antigravity
#
# ==============================================================================

$ErrorActionPreference = "Stop"

$SOURCE = "C:\dev\rota-verde-railway\SISTEMA_OFICIAL"
$DEST = "C:\dev\rota-verde-railway\Servidor-Producao"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Sincronização OFICIAL → PRODUÇÃO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se diretórios existem
if (!(Test-Path $SOURCE)) {
    Write-Host "❌ ERRO: Diretório SOURCE não existe: $SOURCE" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $DEST)) {
    Write-Host "❌ ERRO: Diretório DEST não existe: $DEST" -ForegroundColor Red
    exit 1
}

# Arquivos e diretórios para sincronizar
$itemsToSync = @(
    @{ Type = "File"; Path = "client\src\pages\CorridasPage.tsx"; Description = "Página de Corridas" },
    @{ Type = "File"; Path = "client\src\pages\TurnoPage.tsx"; Description = "Página de Turno" },
    @{ Type = "File"; Path = "client\src\pages\CaixaPage.tsx"; Description = "Página de Caixa" },
    @{ Type = "File"; Path = "client\src\pages\VehiclesPage.tsx"; Description = "Página de Veículos" },
    @{ Type = "File"; Path = "client\src\pages\DesempenhoPage.tsx"; Description = "Página de Desempenho" },
    @{ Type = "File"; Path = "client\src\pages\AdminPage.tsx"; Description = "Página Admin" },
    @{ Type = "File"; Path = "client\src\components\MainLayout.tsx"; Description = "Layout Principal" },
    @{ Type = "File"; Path = "client\src\components\Navigation.tsx"; Description = "Navegação" },
    @{ Type = "File"; Path = "client\src\contexts\ThemeContext.tsx"; Description = "Contexto de Tema" },
    @{ Type = "Dir"; Path = "client\src\modules"; Description = "Módulos do Cliente" },
    @{ Type = "Dir"; Path = "shared"; Description = "Código Compartilhado (Schema, Types)" }
)

$synced = 0
$skipped = 0
$errors = 0

foreach ($item in $itemsToSync) {
    $sourcePath = Join-Path $SOURCE $item.Path
    $destPath = Join-Path $DEST $item.Path
    
    Write-Host "📦 $($item.Description) ($($item.Path))" -ForegroundColor Yellow
    
    if (!(Test-Path $sourcePath)) {
        Write-Host "   ⚠️  Não existe no SOURCE, pulando..." -ForegroundColor DarkYellow
        $skipped++
        continue
    }
    
    try {
        if ($item.Type -eq "File") {
            # Copiar arquivo único
            $destDir = Split-Path $destPath -Parent
            if (!(Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            Write-Host "   ✅ Sincronizado!" -ForegroundColor Green
            $synced++
        }
        elseif ($item.Type -eq "Dir") {
            # Copiar diretório inteiro
            if (!(Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            }
            Copy-Item -Path "$sourcePath\*" -Destination $destPath -Recurse -Force
            Write-Host "   ✅ Diretório sincronizado!" -ForegroundColor Green
            $synced++
        }
    }
    catch {
        Write-Host "   ❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
    
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Sincronizados: $synced" -ForegroundColor Green
Write-Host "⚠️  Pulados: $skipped" -ForegroundColor Yellow
Write-Host "❌ Erros: $errors" -ForegroundColor Red
Write-Host ""

if ($errors -eq 0) {
    Write-Host "🎉 Sincronização concluída com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. cd Servidor-Producao" -ForegroundColor White
    Write-Host "   2. git add ." -ForegroundColor White
    Write-Host "   3. git commit -m 'sync: Updated from SISTEMA_OFICIAL'" -ForegroundColor White
    Write-Host "   4. git push origin main" -ForegroundColor White
    exit 0
}
else {
    Write-Host "⚠️  Sincronização concluída com erros. Verifique acima." -ForegroundColor Yellow
    exit 1
}
