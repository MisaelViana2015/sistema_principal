
import fs from 'fs';
import path from 'path';

// O arquivo com o CREATE TABLE
const FILE_TO_SEND = "backups/create_sessions.sql";

// Configurações API
const API_URL = "https://rt-frontend.up.railway.app/api/admin/restore-sql";
const SECRET = "segredo_super_secreto_rota_verde_2025";

async function run() {
    console.log("🛠️ Criando tabela de sessões...");
    const filePath = path.join(process.cwd(), FILE_TO_SEND);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    console.log("🚀 Enviando comando SQL...");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret: SECRET, sqlContent })
        });

        if (!response.ok) throw new Error(await response.text());

        console.log("✅ Tabela 'session' criada com sucesso!");
    } catch (error) {
        console.error("❌ Erro:", error.message);
    }
}

run();
