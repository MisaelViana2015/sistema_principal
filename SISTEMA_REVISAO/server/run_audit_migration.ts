/**
 * Script para executar migration SQL das tabelas de auditoria
 * Executa: 0004_add_audit_tables.sql
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ DATABASE_URL não definida!");
        process.exit(1);
    }

    const pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log("🔌 Conectando ao banco...");
        const client = await pool.connect();

        const sqlPath = path.join(__dirname, "migrations", "0004_add_audit_tables.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");

        console.log("📋 Executando migration...");
        await client.query(sql);

        console.log("✅ Migration executada com sucesso!");

        // Verificar se as tabelas foram criadas
        const tables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('audit_logs', 'entity_history')
        `);

        console.log("📊 Tabelas criadas:");
        tables.rows.forEach((row: any) => console.log(`   - ${row.table_name}`));

        client.release();
        await pool.end();

    } catch (error) {
        console.error("❌ Erro ao executar migration:", error);
        process.exit(1);
    }
}

runMigration();
