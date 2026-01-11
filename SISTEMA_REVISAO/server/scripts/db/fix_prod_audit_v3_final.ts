
import pg from "pg";
const { Pool } = pg;

const CONNECTION_STRING = "postgresql://postgres:QGtJKrxgQqoPYFDQraMZyXdBJxeuJuIM@crossover.proxy.rlwy.net:50382/railway";

async function main() {
    console.log("🚀 Iniciando correção V3 (FINAL) no banco de PRODUÇÃO...");
    console.log("🛠️  Adicionando colunas faltantes: source, request_id, ip, meta...");

    const pool = new Pool({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // Adicionando todas as colunas que podem estar faltando conforme shared/schema.ts auditLogs
        await client.query(`
            ALTER TABLE audit_logs
            ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'api',
            ADD COLUMN IF NOT EXISTS "request_id" VARCHAR,
            ADD COLUMN IF NOT EXISTS "ip" TEXT,
            ADD COLUMN IF NOT EXISTS "meta" JSONB DEFAULT '{}'::jsonb,
            ADD COLUMN IF NOT EXISTS "user_agent" TEXT; -- Garantir que existe, embora estava no script v1
        `);

        console.log("✅ Colunas extras adicionadas com sucesso.");
        client.release();

    } catch (error) {
        console.error("❌ Erro fatal durante a migração manual V3:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
