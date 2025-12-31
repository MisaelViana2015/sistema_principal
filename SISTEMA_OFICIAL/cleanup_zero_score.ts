
import { db } from "./server/modules/core/db/connection.js";
import { fraudEvents } from "./shared/schema.js";
import { eq, and, sql } from "drizzle-orm";

async function cleanupZeroScore() {
    console.log("🧹 Iniciando limpeza de alertas com Score 0...");

    const result = await db.execute(sql`
        UPDATE fraud_events 
        SET status = 'descartado', 
            metadata = jsonb_set(metadata, '{autoDiscarded}', 'true')
        WHERE risk_score = 0 
          AND status IN ('pendente', 'em_analise')
    `);

    // Drizzle execute result structure depends on driver, let's assume standard count check or just log success
    console.log("✅ Limpeza concluída!");
    process.exit(0);
}

cleanupZeroScore().catch(console.error);
