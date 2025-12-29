
import "dotenv/config";
import app from "./app.js";
import { testConnection, closeConnection, db } from "./core/db/connection.js";
import { runMigrations } from "./core/db/migrator.js";
import { sql } from "drizzle-orm";
import { FraudService } from "./modules/fraud/fraud.service.js";

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

const PORT = process.env.PORT || 3000;
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

        // Fix Vehicles
        await db.execute(sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color text`);
        await db.execute(sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url text`);

        // Fix Tires (CRITICAL for Refactor)
        await db.execute(sql`ALTER TABLE tires ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2) DEFAULT 0`);

        // Fix Shifts (CRITICAL for Start Shift)
        await db.execute(sql`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_custos_particular real DEFAULT 0`);

        // Fix Expenses (CRITICAL for Costs)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "expenses" (
                "id" varchar PRIMARY KEY NOT NULL,
                "driver_id" varchar,
                "shift_id" varchar,
                "cost_type_id" varchar NOT NULL,
                "valor" numeric(12, 2) NOT NULL,
                "date" timestamp NOT NULL,
                "notes" text,
                "is_particular" boolean DEFAULT false
            )
        `);
        await db.execute(sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_particular boolean DEFAULT false`);
        await db.execute(sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_split_cost boolean DEFAULT false`);
        await db.execute(sql`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS discount_company real DEFAULT 0`);
        await db.execute(sql`ALTER TABLE shifts ADD COLUMN IF NOT EXISTS discount_driver real DEFAULT 0`);
        await db.execute(sql`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativo'`);

        // Fix Cost Types (CRITICAL if missing)
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "cost_types" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "category" text DEFAULT 'Variável' NOT NULL,
                "description" text,
                "is_active" boolean DEFAULT true NOT NULL,
                "visible_to_driver" boolean DEFAULT true NOT NULL,
                "icon" text,
                "color" text
            )
        `);
        await db.execute(sql`ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS visible_to_driver boolean DEFAULT true`);

        // Fix Fixed Costs columns (Prevent 500 on Update)
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS total_installments integer`);
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS start_date timestamp`);
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS description text`);
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS vendor text`);
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true`);

        // Fix Fixed Cost Installments columns (CRITICAL for payment tracking)
        await db.execute(sql`ALTER TABLE fixed_cost_installments ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2)`);
        await db.execute(sql`ALTER TABLE fixed_cost_installments ADD COLUMN IF NOT EXISTS paid_date timestamp`);

        console.log("✅ Schema verificado: colunas shifts, expenses, cost_types, vehicles, fixed_costs e fixed_cost_installments garantidas.");
    } catch (error) {
        console.error("⚠️  Erro ao verificar schema:", error);
    }
}

/**
 * Fraud Analysis Scheduler
 * Analisa turnos abertos automaticamente a cada 5 minutos
 */
// Fraud scheduler removed in favor of event-based trigger on shift finish
// function startFraudScheduler() { ... }

// function runFraudAnalysis() { ... }

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
                    if (connected) {
                        console.log("✅ Banco de dados conectado e sincronizado!");
                        // Fraud scheduler removed
                    }
                });
            }).catch(async err => {
                console.error("⚠️  AVISO CRÍTICO: Falha na auto-migração. O servidor continuará rodando para permitir reparos via API.", err);
                // Mesmo com erro, tenta hotfix e conectar
                await ensureSchemaIntegrity();
                testConnection().then((connected) => {
                    if (connected) { /* Fraud scheduler removed */ }
                });
            });
        } else {
            testConnection().then(async (connected) => {
                if (connected) {
                    console.log("✅ Banco de dados conectado!");
                    // Dev mode também roda pra garantir
                    await ensureSchemaIntegrity();
                    // Fraud scheduler removed used to be here
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
