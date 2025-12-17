import { db } from './server/core/db/connection.js';
import { sql } from 'drizzle-orm';
import fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Caminho CORRIGIDO: Apenas 1 nível acima para sair de Servidor-Teste e entrar em Backups_Servidores
        const targetFolder = path.resolve(__dirname, '../Backups_Servidores/Database/Backup_Manual_' + timestamp);

        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }

        console.log(`📂 Salvando backup em: ${targetFolder}`);

        // Lista de todas as tabelas
        const tables = [
            'drivers', 'vehicles', 'tires',
            'users', 'sessions', 'shifts', 'rides', 'cost_types', 'expenses',
            'maintenances', 'legacy_maintenances', 'maintenance_reviews', 'vehicle_notes', 'features'
        ];

        for (const table of tables) {
            try {
                console.log(`Baixando ${table}...`);
                const result = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
                fs.writeFileSync(path.join(targetFolder, `${table}.json`), JSON.stringify(result.rows, null, 2));
                console.log(`${table} ok (${result.rows.length} registros).`);
            } catch (err: any) {
                console.log(`⚠️ Erro ao baixar ${table}: ${err.message}`);
                // Não abortar, continuar para próximas
            }
        }

        console.log("✅ Backup completo salvo!");
        process.exit(0);
    } catch (e) {
        console.error("Erro:", e);
        process.exit(1);
    }
}
run();
