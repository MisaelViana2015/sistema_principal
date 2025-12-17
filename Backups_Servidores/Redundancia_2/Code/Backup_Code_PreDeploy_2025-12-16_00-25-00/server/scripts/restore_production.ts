
import { exec } from "child_process";
import path from "path";
import dotenv from "dotenv";

// Load env vars from .env file in project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = "postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway";
const BACKUP_PATH = path.resolve(process.cwd(), "../Replit/rota_verde_producao_backup.sql");

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL não definida no arquivo .env");
    process.exit(1);
}

console.log(`🔌 Restaurando banco de dados a partir de: ${BACKUP_PATH}`);
console.log(`🎯 Alvo: ${DATABASE_URL.split("@")[1]}`); // Log masked URL

// Command to restore
// Using --clean to drop existing objects, --if-exists to avoid errors if they don't exist
// --no-owner --no-acl to avoid permission issues
// Command to restore (using psql for text format dumps)
const command = `psql "${DATABASE_URL}" -f "${BACKUP_PATH}"`;

console.log("🚀 Iniciando restauração... (isso pode levar alguns minutos)");

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Erro na execução: ${error.message}`);
        console.error(stderr);
        return;
    }
    if (stderr) {
        console.log(`⚠️ Aviso/Log pg_restore:\n${stderr}`);
    }
    console.log(`✅ Restauração concluída com sucesso!`);
    console.log(stdout);
});
