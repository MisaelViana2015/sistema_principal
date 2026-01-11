
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function check() {
    try {
        console.log("🔍 Verificando schema da tabela shifts...");
        const result = await db.execute(sql`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'shifts' AND column_name = 'total_custos_particular';
        `);

        if (result.rows.length > 0) {
            console.log("✅ Coluna 'total_custos_particular' EXISTE em 'shifts'.");
        } else {
            console.log("❌ Coluna 'total_custos_particular' NÃO ENCONTRADA em 'shifts'!");
        }

        const resultExpenses = await db.execute(sql`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'expenses' AND column_name = 'is_particular';
        `);

        if (resultExpenses.rows.length > 0) {
            console.log("✅ Coluna 'is_particular' EXISTE em 'expenses'.");
        } else {
            console.log("❌ Coluna 'is_particular' NÃO ENCONTRADA em 'expenses'!");
        }

    } catch (error) {
        console.error("❌ Erro ao verificar schema:", error);
    }
    process.exit(0);
}

check();
