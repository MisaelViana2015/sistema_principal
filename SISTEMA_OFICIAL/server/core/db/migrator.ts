
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./connection.js";
import path from "path";
import { fileURLToPath } from "url";

export async function runMigrations() {
    console.log("🔄 Verificando migrações pendentes...");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Em produção (dist), a estrutura muda.
    // Tentar localizar a pasta de migrações de forma robusta
    let migrationsFolder = path.join(__dirname, "../../scripts/db/migrations");

    // Se estivermos rodando do 'dist', precisamos subir mais níveis ou buscar na raiz do app
    if (process.env.NODE_ENV === 'production') {
        // No Docker/Railway, copiamos as migrações para /app/server/scripts/db/migrations
        // O WORKDIR é /app, então process.cwd() é /app (ou /app/server dependendo do startup. Mas a cópia foi para ./server/scripts...)

        // Caminho relativo ao WORKDIR (/app):
        migrationsFolder = path.resolve(process.cwd(), "server/scripts/db/migrations");
    }

    console.log(`📂 Pasta de migrações alvo: ${migrationsFolder}`);

    try {
        await migrate(db, { migrationsFolder });
        console.log("✅ Migrações aplicadas com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao aplicar migrações:", error);
        // Em produção, falha de migração pode ser crítica, mas vamos deixar seguir para logar
    }
}
