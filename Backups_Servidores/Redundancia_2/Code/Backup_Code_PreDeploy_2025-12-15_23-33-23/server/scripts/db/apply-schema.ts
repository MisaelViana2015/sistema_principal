import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drivers, sessions } from "../../../shared/schema.js";
import { sql } from "drizzle-orm";

/**
 * SCRIPT PARA APLICAR SCHEMA NO BANCO
 * 
 * Cria as tabelas drivers e sessions se não existirem
 */

async function applySchema() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("❌ DATABASE_URL não definida no .env");
        process.exit(1);
    }

    console.log("🔌 Conectando ao banco de dados...");

    const client = postgres(connectionString);
    const db = drizzle(client);

    try {
        console.log("📝 Aplicando schema...");

        // Criar tabela drivers
        await client.unsafe(`
            CREATE TABLE IF NOT EXISTS drivers (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                telefone TEXT,
                senha TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'driver',
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        console.log("✅ Tabela 'drivers' criada/verificada");

        // Criar tabela sessions
        await client.unsafe(`
            CREATE TABLE IF NOT EXISTS sessions (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
                driver_id VARCHAR(36) NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                ip_address TEXT,
                user_agent TEXT,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
        `);

        console.log("✅ Tabela 'sessions' criada/verificada");

        console.log("\\n✅ Schema aplicado com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao aplicar schema:", error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applySchema();
