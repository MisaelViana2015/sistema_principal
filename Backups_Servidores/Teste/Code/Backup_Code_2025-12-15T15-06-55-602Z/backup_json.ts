
import { db } from './server/core/db/connection.js';
import * as schema from './shared/schema.js';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function backupToJson() {
    // Caminho simplificado para visibilidade imediata
    const backupDir = path.resolve(__dirname, 'BACKUP_AGORA_JSON');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`Iniciando backup JSON em: ${backupDir}`);

    // Lista de tabelas para salvar (Resiliente: se falhar, pula)
    const tables = [
        'users',
        'vehicles',
        'drivers',
        'shifts',
        'rides',
        'legacy_maintenances',
        'expenses',
        'cost_types',
        'tires'
    ];

    for (const tableName of tables) {
        try {
            console.log(`Baixando tabela: ${tableName}...`);
            const result = await db.execute(sql.raw(`SELECT * FROM "${tableName}"`)); // Aspas duplas para evitar erros de case

            const filePath = path.join(backupDir, `${tableName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2));
            console.log(`✅ Salvo: ${tableName}.json (${result.rows.length} registros)`);
        } catch (error: any) {
            console.warn(`⚠️ Erro ao salvar tabela '${tableName}' (pode não existir): ${error.message}`);
        }
    }

    console.log("\nBackup JSON concluído com sucesso!");
    process.exit(0);
}

backupToJson().catch(console.error);
