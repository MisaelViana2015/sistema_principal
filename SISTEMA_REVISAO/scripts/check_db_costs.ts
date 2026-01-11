
import { db } from "../server/core/db/connection.js";
import { fixedCosts } from "../shared/schema.js";

async function checkFixedCosts() {
    try {
        console.log("🔍 Checking 'fixed_costs' table...");
        const costs = await db.select().from(fixedCosts);

        console.log(`\n📊 Total Records Found: ${costs.length}`);

        if (costs.length > 0) {
            console.table(costs.map(c => ({
                id: c.id,
                name: c.name,
                value: c.value,
                active: c.isActive
            })));
        } else {
            console.log("❌ Table is empty.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error querying database:", error);
        process.exit(1);
    }
}

checkFixedCosts();
