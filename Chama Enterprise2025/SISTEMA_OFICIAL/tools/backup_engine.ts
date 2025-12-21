import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/core/db/connection.js';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração: Salvar em 3 locais para redundância
// Ajustado para ../../Backups_Servidores (dentro de rota-verde-railway)
const BACKUP_ROOTS = [
    path.resolve(__dirname, '../../Backups_Servidores/Oficial/Database'),
    path.resolve(__dirname, '../../Backups_Servidores/Redundancia_1/Database'),
    path.resolve(__dirname, '../../Backups_Servidores/Redundancia_2/Database')
];

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

async function run() {
    console.log(`\n⏳ Iniciando Backup Automático de DADOS (3 Cópias)...`);

    // Carregar dados de todas as tabelas na memória primeiro
    const tables = [
        'users', 'vehicles', 'drivers', 'shifts', 'rides',
        'tires', 'cost_types', 'expenses', 'maintenances',
        'legacy_maintenances', 'maintenance_reviews', 'vehicle_notes', 'features', 'sessions'
    ];

    const tableData: Record<string, any[]> = {};

    for (const table of tables) {
        try {
            const result = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
            tableData[table] = result.rows;
        } catch (e: any) {
            // Silencioso se tabela não existir
        }
    }

    // Gravar em todos os destinos
    for (const root of BACKUP_ROOTS) {
        const destDir = path.join(root, `Backup_Auto_${TIMESTAMP}`);
        console.log(`   📂 Salvando em: ${destDir}`);

        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        for (const [table, rows] of Object.entries(tableData)) {
            fs.writeFileSync(path.join(destDir, `${table}.json`), JSON.stringify(rows, null, 2));
        }
    }

    console.log(`\n✅ Backup de Dados concluído e replicado em 3 locais.`);
    process.exit(0);
}

run().catch(() => process.exit(1));
