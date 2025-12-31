
import { db } from "./server/core/db/connection.js";
import { fraudEvents } from "./shared/schema.js";
import { sql } from "drizzle-orm";

async function checkFraudScores() {
    try {
        console.log("Checking Fraud Events Scores for Pending items...");
        const result = await db.execute(sql`
            SELECT id, status, risk_score as "riskScore", created_at 
            FROM fraud_events 
            WHERE status = 'pendente'
            LIMIT 10
        `);
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

checkFraudScores();
