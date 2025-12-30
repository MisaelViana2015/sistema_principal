#!/bin/sh
# ================================================================
# ENTRYPOINT DO CONTAINER ROTA VERDE
# ================================================================
# Este script é executado ANTES do servidor Node.js iniciar.
# Responsável por:
#   1. Executar bootstrap de banco se DB_BOOTSTRAP_TOKEN existir
#   2. Iniciar o servidor normalmente
#
# SEGURANÇA:
#   - O token é usado apenas aqui e não persiste
#   - Após execução, a variável é removida do ambiente
# ================================================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 ROTA VERDE - INICIANDO CONTAINER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se existe token de bootstrap
if [ -n "$DB_BOOTSTRAP_TOKEN" ]; then
    echo ""
    echo "📦 [BOOTSTRAP] Token de migração detectado"
    echo "📦 [BOOTSTRAP] Executando migrações..."
    
    # Executar bootstrap (caminho compilado real)
    node /app/server/dist/server/src/scripts/bootstrap.js
    
    BOOTSTRAP_EXIT=$?
    
    if [ $BOOTSTRAP_EXIT -ne 0 ]; then
        echo "❌ [BOOTSTRAP] FALHA! Container não iniciará."
        exit 1
    fi
    
    # Limpar token do ambiente (segurança)
    unset DB_BOOTSTRAP_TOKEN
    echo "🔒 [BOOTSTRAP] Token removido da memória"
else
    echo "⏭️  [BOOTSTRAP] Sem token de migração. Pulando bootstrap..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🟢 INICIANDO SERVIDOR NODE.JS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Executar o comando original (passado como argumento)
exec "$@"
