
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BACKUP_ROOT = path.resolve(__dirname, '../../Backups_Servidores/Oficial/Code');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const DEST_DIR = path.join(BACKUP_ROOT, `Backup_Code_Producao_${TIMESTAMP}`);

console.log(`📦 Criando cópia do código em OFICIAL para garantir integridade...`);
console.log(`   📂 Destino: ${DEST_DIR}`);

if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

const IGNORE_LIST = ['node_modules', '.git', 'dist', 'coverage', '.nixpacks', 'Backups_Servidores'];

function copyRecursive(src: string, dest: string) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        const dirName = path.basename(src);
        if (IGNORE_LIST.includes(dirName)) return;

        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    const entries = fs.readdirSync(PROJECT_ROOT);
    for (const entry of entries) {
        if (path.resolve(PROJECT_ROOT, entry).includes('Backups_Servidores')) continue;
        copyRecursive(path.join(PROJECT_ROOT, entry), path.join(DEST_DIR, entry));
    }
    console.log(`✅ Código de Produção (versão atual local) salvo em Oficial/Code.`);
} catch (e: any) {
    console.error(`❌ Erro: ${e.message}`);
}
