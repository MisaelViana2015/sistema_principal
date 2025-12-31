
import { db } from "./server/core/db/connection.js";
import { fraudEvents } from "./shared/schema.js";
import { sql } from "drizzle-orm";

async function checkFraudStatus() {
    try {
        console.log("Checking Fraud Events Status...");
        const result = await db.execute(sql`
            SELECT status, COUNT(*) as count 
            FROM fraud_events 
            GROUP BY status
        `);
        console.table(result.rows);
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

checkFraudStatus();
