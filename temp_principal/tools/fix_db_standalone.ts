
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

async function main() {
    console.log("Conectando ao banco...");
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("DATABASE_URL não definida no .env");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("Conectado! Executando ALTER TABLE...");

        await client.query("ALTER TABLE cost_types ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true");
        console.log("SUCESSO: Coluna 'is_active' adicionada.");

        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error("ERRO:", error);
        process.exit(1);
    }
}

main();
