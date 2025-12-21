
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function main() {
    console.log("Iniciando migração manual da tabela tires (Via pg driver)...");

    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL não definida.");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });

    try {
        const client = await pool.connect();
        console.log("Conectado ao banco.");

        await client.query(`
            CREATE TABLE IF NOT EXISTS "tires" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "vehicle_id" uuid REFERENCES "vehicles"("id"),
                "position" text NOT NULL,
                "brand" text NOT NULL,
                "model" text NOT NULL,
                "status" text NOT NULL,
                "install_date" timestamp NOT NULL,
                "install_km" integer NOT NULL,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);
        console.log("Tabela 'tires' criada com sucesso.");
        client.release();
    } catch (error) {
        console.error("Erro na migração:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

main();
