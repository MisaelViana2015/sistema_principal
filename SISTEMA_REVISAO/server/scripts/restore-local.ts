
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';

dotenv.config();

// Config
const BACKUP_FILE = path.join(process.cwd(), 'server/backups/backup_simple_2025-12-26T04-42-32-616Z.sql');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL não definida!");
    process.exit(1);
}

console.log("🔄 Iniciando Restauração do Banco de Dados...");
console.log(`📂 Arquivo: ${BACKUP_FILE}`);
console.log(`🔌 URL: ${DATABASE_URL}`); // Em dev local pode printar, cuidado em prod

// Comando psql
// psql [URL] < [FILE]
const command = `psql "${DATABASE_URL}" < "${BACKUP_FILE}"`;

// Opção para Windows: pode ser necessário ajustar as aspas ou usar shell
// Se o path tiver espaços, as aspas no arquivo são cruciais. DATABASE_URL também.

console.log("⏳ Executando...");

exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Erro na execução: ${error.message}`);
        console.error(`Status code: ${error.code}`);
        return;
    }

    if (stderr) {
        // psql manda outputs normais no stderr as vezes, nem sempre é erro critico
        console.log(`⚠️  Output (stderr): ${stderr.slice(0, 500)}...`);
    }

    console.log(`✅ Restauração Concluída!`);
    console.log(`📄 Log (stdout): ${stdout.slice(0, 200)}...`);
});
