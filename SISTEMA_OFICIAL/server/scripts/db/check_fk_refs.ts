
import { db } from '../../core/db/connection.js';
import { vehicles, costTypes } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkFK() {
    console.log("Checking FK references in production...");

    const vehicleId = '89146774-1d45-46c2-aa6c-abd1884d90c9';
    const costTypeId = 'd7a8f090-2ecb-4abc-945b-04e20935203a';

    try {
        // Check Vehicle
        const vehicle = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
        console.log("Vehicle found:", vehicle.length > 0 ? `YES - ${vehicle[0].plate}` : "NO");

        // Check Cost Type
        const costType = await db.select().from(costTypes).where(eq(costTypes.id, costTypeId)).limit(1);
        console.log("CostType found:", costType.length > 0 ? `YES - ${costType[0].name}` : "NO");

        // List all cost types
        const allTypes = await db.select().from(costTypes);
        console.log("\nAll Cost Types in DB:");
        allTypes.forEach(t => console.log(`  - ${t.id}: ${t.name}`));

    } catch (e: any) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}

checkFK();
