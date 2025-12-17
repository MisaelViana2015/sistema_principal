
import fs from 'fs';
import path from 'path';

const INPUT_FILE = "backups/backup_simple_2025-12-13T21-06-16-209Z.sql";
const OUTPUT_FILE = "backups/backup_clean.sql";

// Configurações API
const API_URL = "https://rt-frontend.up.railway.app/api/admin/restore-sql";
const SECRET = "segredo_super_secreto_rota_verde_2025";

async function run() {
    console.log("🧹 Limpando backup de dados inválidos...");
    const filePath = path.join(process.cwd(), INPUT_FILE);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Remover a seção de Logs que está corrompida com [object Object]
    // A estratégia é pegar tudo ANTES de "-- Tabela: logs"
    const parts = content.split('-- Tabela: logs');
    const cleanContent = parts[0];

    console.log(`📉 Reduzido de ${(content.length / 1024).toFixed(2)}kb para ${(cleanContent.length / 1024).toFixed(2)}kb`);

    fs.writeFileSync(path.join(process.cwd(), OUTPUT_FILE), cleanContent, 'utf-8');
    console.log("✅ Arquivo limpo salvo em:", OUTPUT_FILE);

    // Enviar agora
    console.log("🚀 Enviando backup LIMPO para o servidor...");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                secret: SECRET,
                sqlContent: cleanContent
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erro API (${response.status}): ${text}`);
        }

        const data = await response.json();
        console.log("✅ SUCESSO TOTAL!", data);

    } catch (error) {
        console.error("❌ FALHA NO ENVIO:", error.message);
    }
}

run();
