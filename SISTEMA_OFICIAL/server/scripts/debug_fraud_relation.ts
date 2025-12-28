
import { db } from '../core/db/connection.js';

async function debugRelation() {
    console.log("🔍 Debugging Fraud Events Relation...");
    try {
        const events = await db.query.fraudEvents.findMany({
            limit: 5,
            with: {
                driver: true
            }
        });

        console.log(`Found ${events.length} events.`);
        if (events.length > 0) {
            events.forEach((e, i) => {
                console.log(`[${i}] ID: ${e.id} | DriverID: ${e.driverId}`);
                console.log(`    -> Driver Object:`, e.driver);
            });
        }
    } catch (error) {
        console.error("❌ Error querying relations:", error);
    }
    process.exit(0);
}

debugRelation();
