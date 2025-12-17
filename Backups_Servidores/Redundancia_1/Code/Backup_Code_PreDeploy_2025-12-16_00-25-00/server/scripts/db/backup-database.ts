import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

/**
 * SCRIPT DE BACKUP DO BANCO DE DADOS
 * 
 * Faz backup completo do PostgreSQL do Railway
 * Salva na pasta backups/ com timestamp
 */

const BACKUP_DIR = path.join(process.cwd(), "backups");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL não configurada!");
    process.exit(1);
}

async function createBackup() {
    try {
        // Cria pasta de backups se não existir
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log("📁 Pasta de backups criada");
        }

        // Nome do arquivo com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `backup_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        console.log("🔄 Iniciando backup do banco de dados...");
        console.log(`📦 Arquivo: ${filename}`);

        // Executa pg_dump
        const command = `pg_dump "${DATABASE_URL}" > "${filepath}"`;

        await execAsync(command);

        // Verifica se o arquivo foi criado
        const stats = fs.statSync(filepath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log("✅ Backup concluído com sucesso!");
        console.log(`📊 Tamanho: ${sizeMB} MB`);
        console.log(`📍 Local: ${filepath}`);

        // Lista todos os backups
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.sql'))
            .map(f => ({
                name: f,
                size: (fs.statSync(path.join(BACKUP_DIR, f)).size / (1024 * 1024)).toFixed(2)
            }));

        console.log(`\n📋 Total de backups: ${backups.length}`);
        backups.forEach(b => {
            console.log(`   - ${b.name} (${b.size} MB)`);
        });

    } catch (error: any) {
        console.error("❌ Erro ao criar backup:", error.message);
        process.exit(1);
    }
}

createBackup();
