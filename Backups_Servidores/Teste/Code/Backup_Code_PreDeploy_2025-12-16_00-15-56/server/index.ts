
import "dotenv/config";
import app from "./app.js";
import { testConnection, closeConnection, db } from "./core/db/connection.js";
import { runMigrations } from "./core/db/migrator.js";
import { sql } from "drizzle-orm";

/**
 * BOOT DO SERVIDOR (GERENTE GERAL)
 * 
 * REGRAS ABSOLUTAS:
 * - Este arquivo APENAS inicia o servidor
 * - NÃO contém lógica de negócio
 * - NÃO faz queries no banco
 * - NÃO define rotas
 * - Apenas orquestra a inicialização
 */

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

/**
 * Emergency Schema Fixer
 * Garante que as colunas novas existam mesmo se a migração falhar
 */
async function ensureSchemaIntegrity() {
    console.log("🛠️  Verificando integridade do schema (Emergency Patch)...");
    try {
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS icon text`);
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS color text`);
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`);
        console.log("✅ Schema verificado: colunas cost_types garantidas.");
    } catch (error) {
        console.error("⚠️  Erro ao verificar schema:", error);
    }
}

/**
 * Função de inicialização
 */
async function startServer() {
    try {
        console.log("🚀 Iniciando Sistema Rota Verde...");
        console.log(`📍 Ambiente: ${ENV}`);
        console.log(`🔌 Porta: ${PORT}`);

        // Inicia servidor HTTP IMEDIATAMENTE (Fast Startup)
        const server = app.listen(Number(PORT), () => {
            console.log(`\n✅ Servidor rodando na porta ${PORT}`);
            console.log(`✅ Health check: /health`);
            console.log(`✅ API: /api`);
        });

        // Conecta ao banco de dados em background (apenas teste de conexão)
        console.log("\n🔍 Conectando ao banco de dados...");

        // Executar migrações ANTES de aceitar conexões reais (ou em paralelo se safe)
        // Em produção, queremos garantir que o banco esteja pronto
        if (ENV === 'production') {
            // Tenta migrar, mas não derruba o servidor se falhar
            runMigrations().then(async () => {
                // HOTFIX: Garante colunas manualmente
                await ensureSchemaIntegrity();

                testConnection().then((connected) => {
                    if (connected) console.log("✅ Banco de dados conectado e sincronizado!");
                });
            }).catch(async err => {
                console.error("⚠️  AVISO CRÍTICO: Falha na auto-migração. O servidor continuará rodando para permitir reparos via API.", err);
                // Mesmo com erro, tenta hotfix e conectar
                await ensureSchemaIntegrity();
                testConnection();
            });
        } else {
            testConnection().then(async (connected) => {
                if (connected) {
                    console.log("✅ Banco de dados conectado!");
                    // Dev mode também roda pra garantir
                    await ensureSchemaIntegrity();
                }
            });
        }

        // Graceful shutdown
        const shutdown = async () => {
            console.log("\n⚠️  Encerrando servidor...");

            server.close(async () => {
                console.log("🔌 Servidor HTTP encerrado");

                await closeConnection();

                console.log("✅ Shutdown completo");
                process.exit(0);
            });

            // Força shutdown após 10 segundos
            setTimeout(() => {
                console.error("❌ Shutdown forçado após timeout");
                process.exit(1);
            }, 10000);
        };

        // Escuta sinais de encerramento
        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);

    } catch (error) {
        console.error("❌ Erro ao iniciar servidor:", error);
        process.exit(1);
    }
}

// Inicia o servidor
startServer();
