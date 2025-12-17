
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// URL HARDCODED PARA GARANTIR EXECUÇÃO IMEDIATA (Segurança: apagar este arquivo depois)
const dbUrl = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";

const date = new Date().toISOString().replace(/[:.]/g, '-');
// Caminho ajustado para subir 2 níveis a partir de Servidor-Teste
const backupDir = path.resolve(__dirname, '../../Backups_Servidores/Database');
const backupFile = path.join(backupDir, `rota-verde_MANUAL_${date}.sql`);

console.log(`Diretório de destino: ${backupDir}`);

if (!fs.existsSync(backupDir)) {
    console.log("Criando diretório...");
    fs.mkdirSync(backupDir, { recursive: true });
}

console.log(`Iniciando backup...`);
console.log(`Arquivo alvo: ${backupFile}`);

// Comando usando --dbname para maior compatibilidade
const command = `pg_dump --dbname="${dbUrl}" --clean --if-exists --no-owner --no-acl --file="${backupFile}"`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`ERRO AO EXECUTAR BACKUP: ${error.message}`);
        console.error(`STDERR: ${stderr}`);
        return;
    }
    console.log(`SUCESSO! Backup salvo em: ${backupFile}`);
    if (stderr) console.log(`Avisos: ${stderr}`);
});
