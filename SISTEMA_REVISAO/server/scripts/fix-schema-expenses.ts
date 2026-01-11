
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function fixSchema() {
    try {
        console.log("🛠️ Corrigindo schema: Adicionando 'is_particular' em 'expenses'...");

        await db.execute(sql`
            ALTER TABLE "expenses"
            ADD COLUMN IF NOT EXISTS "is_particular" boolean DEFAULT false;
        `);

        console.log("✅ Coluna 'is_particular' adicionada com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao corrigir schema:", error);
    }
    process.exit(0);
}

fixSchema();
