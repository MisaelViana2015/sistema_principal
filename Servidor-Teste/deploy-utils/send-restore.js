
import fs from 'fs';
import path from 'path';

// Configurações
const API_URL = "https://rt-frontend.up.railway.app/api/admin/restore-sql";
const SECRET = "segredo_super_secreto_rota_verde_2025";
const BACKUP_FILE = "backups/backup_simple_2025-12-13T21-06-16-209Z.sql";

async function run() {
    console.log("📦 Lendo arquivo de backup...");
    // Caminho absoluto para garantir
    const filePath = path.join(process.cwd(), BACKUP_FILE);

    if (!fs.existsSync(filePath)) {
        console.error("❌ Arquivo não encontrado:", filePath);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    console.log(`📊 Tamanho do SQL: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);

    console.log("🚀 Enviando para o servidor...");

    try {
        // Fetch nativo do Node.js (sem dependências externas)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secret: SECRET,
                sqlContent: sqlContent
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erro API (${response.status}): ${text}`);
        }

        const data = await response.json();
        console.log("✅ SUCESSO!", data);
    } catch (error) {
        console.error("❌ FALHA:", error.message);
    }
}

run();
