import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;
import fs from "fs";
import path from "path";

/**
 * BACKUP SIMPLES DO BANCO - SEM PG_DUMP
 * Exporta dados das tabelas em formato SQL
 */

const BACKUP_DIR = path.join(process.cwd(), "backups");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL não configurada!");
    process.exit(1);
}

async function createBackup() {
    const client = new Client({ connectionString: DATABASE_URL });

    try {
        await client.connect();
        console.log("✅ Conectado ao banco");

        // Cria pasta de backups
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `backup_simple_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        let sqlContent = `-- Backup Rota Verde - ${new Date().toISOString()}\n\n`;

        // Busca tabelas existentes
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT LIKE '__drizzle%'
        `);

        const tables = tablesResult.rows.map(r => r.table_name);
        console.log(`📋 Tabelas encontradas: ${tables.join(", ")}`);

        for (const table of tables) {
            console.log(`📦 Fazendo backup da tabela: ${table}`);

            // Busca todos os dados
            const result = await client.query(`SELECT * FROM ${table}`);

            if (result.rows.length === 0) {
                sqlContent += `-- Tabela ${table} vazia\n\n`;
                continue;
            }

            // Cria INSERT statements
            sqlContent += `-- Tabela: ${table} (${result.rows.length} registros)\n`;
            sqlContent += `TRUNCATE TABLE ${table} CASCADE;\n`;

            for (const row of result.rows) {
                const columns = Object.keys(row).join(", ");
                const values = Object.values(row)
                    .map(v => {
                        if (v === null) return "NULL";
                        if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
                        if (v instanceof Date) return `'${v.toISOString()}'`;
                        return v;
                    })
                    .join(", ");

                sqlContent += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
            }

            sqlContent += `\n`;
        }

        // Salva arquivo
        fs.writeFileSync(filepath, sqlContent, "utf-8");

        const sizeMB = (fs.statSync(filepath).size / (1024 * 1024)).toFixed(2);

        console.log("✅ Backup concluído!");
        console.log(`📊 Tamanho: ${sizeMB} MB`);
        console.log(`📍 Local: ${filepath}`);

        // Lista backups
        const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".sql"));
        console.log(`\n📋 Total de backups: ${backups.length}`);

    } catch (error: any) {
        console.error("❌ Erro:", error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

createBackup();
