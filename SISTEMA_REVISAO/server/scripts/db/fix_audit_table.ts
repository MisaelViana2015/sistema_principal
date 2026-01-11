
import { pool } from "../../core/db/connection";

async function main() {
    console.log("🔍 Iniciando verificação da tabela audit_logs...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ ERRO: DATABASE_URL não definida. Não é possível conectar ao banco.");
        process.exit(1);
    }

    try {
        console.log("🔌 Conectando ao banco...");

        // Tabela
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                action TEXT NOT NULL,
                entity TEXT NOT NULL,
                entity_id INTEGER NOT NULL,
                actor_id INTEGER NOT NULL,
                actor_type TEXT NOT NULL,
                details JSONB,
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                ip_address TEXT,
                user_agent TEXT
            );
        `);
        console.log("✅ Tabela 'audit_logs' garantida.");

        // Índices
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity, entity_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_type, actor_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);`);

        console.log("✅ Índices garantidos.");
        console.log("🚀 Correção aplicada com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao executar SQL:", error);
    } finally {
        await pool.end();
    }
}

main();
