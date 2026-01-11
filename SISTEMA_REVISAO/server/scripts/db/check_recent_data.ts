
import { db } from '../../core/db/connection.js';
import { fixedCosts, fixedCostInstallments } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkData() {
    console.log("Checking Fixed Costs...");
    const costs = await db.select().from(fixedCosts);
    console.log(`Total Fixed Costs: ${costs.length}`);

    let missingInstallmentsCount = 0;

    for (const cost of costs) {
        // Fetch installments
        const installments = await db.select().from(fixedCostInstallments).where(eq(fixedCostInstallments.fixedCostId, cost.id));

        console.log(`\nCost: ${cost.name} | Total Installments: ${cost.totalInstallments} | Generated: ${installments.length}`);

        if (installments.length === 0 && (cost.totalInstallments || 0) > 0) {
            console.log("WARNING: No installments found!");
            missingInstallmentsCount++;
        }
    }

    if (missingInstallmentsCount === 0) {
        console.log("\nAll costs have installments generated.");
    } else {
        console.log(`\nWARNING: ${missingInstallmentsCount} costs represent missing installments.`);
    }

    process.exit(0);
}

checkData().catch(console.error);
