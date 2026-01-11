import { db } from "../core/db/connection.js";
import { sql } from "drizzle-orm";

async function runMigration() {
    console.log("Starting Fraud Intelligence V2 Index Migration...");

    const statements = [
        "CREATE INDEX IF NOT EXISTS idx_fraud_events_driver_id ON fraud_events (driver_id);",
        "CREATE INDEX IF NOT EXISTS idx_fraud_events_shift_id ON fraud_events (shift_id);",
        "CREATE INDEX IF NOT EXISTS idx_fraud_events_detected_at ON fraud_events (detected_at DESC);",
        "CREATE INDEX IF NOT EXISTS idx_shifts_status_inicio ON shifts (status, inicio DESC);",
        "CREATE INDEX IF NOT EXISTS idx_rides_shift_id_hora ON rides (shift_id, hora);",
        "CREATE INDEX IF NOT EXISTS idx_expenses_shift_id ON expenses (shift_id);"
    ];

    for (const stmt of statements) {
        try {
            console.log(`Executing: ${stmt}`);
            await db.execute(sql.raw(stmt));
            console.log("Success.");
        } catch (err: any) {
            console.error(`Error executing statement: ${stmt}`, err.message);
        }
    }

    console.log("Migration finished.");
    process.exit(0);
}

runMigration();
