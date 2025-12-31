
import { db } from "./server/core/db/connection.js";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        console.log("Checking columns for fraud_events...");
        const result = await db.execute(sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'fraud_events'
        `);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

checkColumns();
