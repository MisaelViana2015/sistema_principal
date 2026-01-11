
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function createExpensesTable() {
    try {
        console.log("🛠️ Criando tabela 'expenses' se não existir...");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "expenses" (
                "id" varchar PRIMARY KEY NOT NULL,
                "driver_id" varchar,
                "shift_id" varchar,
                "cost_type_id" varchar NOT NULL,
                "valor" numeric(12, 2) NOT NULL,
                "date" timestamp NOT NULL,
                "notes" text,
                "is_particular" boolean DEFAULT false
            );
        `);

        console.log("✅ Tabela 'expenses' verificada/criada com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao criar tabela:", error);
    }
    process.exit(0);
}

createExpensesTable();
