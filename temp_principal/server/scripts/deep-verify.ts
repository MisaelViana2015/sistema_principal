
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function globalDump() {
    try {
        console.log("🌎 DUMP GLOBAL DE EXPENSES...");

        const allExpenses = await db.execute(sql`
            SELECT id, shift_id, valor, date, is_particular 
            FROM expenses 
            ORDER BY date DESC 
            LIMIT 20
        `);

        console.log(`📊 Total Expenses found: ${allExpenses.rows.length}`);

        for (const row of allExpenses.rows) {
            console.log(`   🧾 [${row.id}] ShiftID: "${row.shift_id}" | Valor: ${row.valor} | Part: ${row.is_particular}`);
        }

    } catch (error) {
        console.error("❌ Erro:", error);
    }
    process.exit(0);
}

globalDump();
