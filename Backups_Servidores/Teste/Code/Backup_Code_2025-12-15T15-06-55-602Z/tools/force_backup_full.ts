
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/core/db/connection.js';
import { sql } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Backup
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const PROJECT_ROOT = path.resolve(__dirname, '..'); // Raiz do projeto (Servidor-Teste)
const BACKUP_ROOT = path.resolve(PROJECT_ROOT, '../Backups_Servidores'); // Pasta de Backups externa

// Destinos Oficiais
const DEST_DB = path.join(BACKUP_ROOT, 'Database/Oficial', `Backup_DB_${TIMESTAMP}`);
const DEST_CODE = path.join(BACKUP_ROOT, 'Code/Oficial', `Backup_Code_${TIMESTAMP}`);

// 1. Função de Backup do Banco (JSON)
async function backupDatabase() {
    console.log(`\n📦 Iniciando Backup do Banco de Dados...`);
    console.log(`   📂 Destino: ${DEST_DB}`);

    if (!fs.existsSync(DEST_DB)) fs.mkdirSync(DEST_DB, { recursive: true });

    const tables = [
        'users', 'vehicles', 'drivers', 'shifts', 'rides',
        'tires', 'cost_types', 'expenses', 'maintenances',
        'legacy_maintenances', 'maintenance_reviews', 'vehicle_notes', 'features', 'sessions'
    ];

    for (const table of tables) {
        try {
            const result = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
            fs.writeFileSync(path.join(DEST_DB, `${table}.json`), JSON.stringify(result.rows, null, 2));
            console.log(`   ✅ Tabela ${table}: ${result.rows.length} registros.`);
        } catch (e: any) {
            console.warn(`   ⚠️  Tabela ${table}: ${e.message} (Ignorado)`);
        }
    }
}

// 2. Função de Backup do Código (Cópia de Arquivos)
function backupCode() {
    console.log(`\n💻 Iniciando Backup do Código Fonte...`);
    console.log(`   📂 Destino: ${DEST_CODE}`);

    if (!fs.existsSync(DEST_CODE)) fs.mkdirSync(DEST_CODE, { recursive: true });

    // Pastas e arquivos para ignorar
    const IGNORE_LIST = ['node_modules', '.git', 'dist', 'coverage', '.nixpacks', 'Backups_Servidores'];

    // Função recursiva de cópia
    function copyRecursive(src: string, dest: string) {
        const stats = fs.statSync(src);
        if (stats.isDirectory()) {
            const dirName = path.basename(src);
            if (IGNORE_LIST.includes(dirName)) return; // Ignorar pastas da lista

            if (!fs.existsSync(dest)) fs.mkdirSync(dest);

            const entries = fs.readdirSync(src);
            for (const entry of entries) {
                copyRecursive(path.join(src, entry), path.join(dest, entry));
            }
        } else {
            fs.copyFileSync(src, dest);
        }
    }

    // Copiar tudo da raiz do projeto para o backup
    try {
        const entries = fs.readdirSync(PROJECT_ROOT);
        for (const entry of entries) {
            // Não copiar a própria pasta de onde estamos saindo se ela estiver dentro (caso raro)
            if (path.resolve(PROJECT_ROOT, entry) === BACKUP_ROOT) continue;

            copyRecursive(path.join(PROJECT_ROOT, entry), path.join(DEST_CODE, entry));
        }
        console.log(`   ✅ Código fonte copiado com sucesso.`);
    } catch (e: any) {
        console.error(`   ❌ Erro ao copiar código: ${e.message}`);
    }
}

async function run() {
    try {
        await backupDatabase();
        backupCode();
        console.log(`\n🚀 BACKUP COMPLETO FINALIZADO!`);
        console.log(`   Dados em: ${DEST_DB}`);
        console.log(`   Código em: ${DEST_CODE}`);
        process.exit(0);
    } catch (e) {
        console.error("Erro fatal:", e);
        process.exit(1);
    }
}

run();
