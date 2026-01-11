
import { db } from '../../core/db/connection.js';
import { fixedCosts, fixedCostInstallments, costTypes } from '../../../shared/schema.js';
import { desc, eq } from 'drizzle-orm';

async function checkData() {
    console.log("Checking Fixed Costs...");
    const costs = await db.select().from(fixedCosts);
    console.log(`Total Fixed Costs: ${costs.length}`);

    for (const cost of costs) {
        console.log(`\nCost ID: ${cost.id}`);
        console.log(`Name: ${cost.name}`);
        console.log(`Value: ${cost.value}`);
        console.log(`Installments (Total): ${cost.totalInstallments}`);
        console.log(`Vehicle ID: ${cost.vehicleId}`);
        console.log(`Cost Type ID: ${cost.costTypeId}`);
        console.log(`Start Date: ${cost.startDate}`);
        console.log(`Due Day: ${cost.dueDay}`);

        // Fetch installments
        const installments = await db.select().from(fixedCostInstallments).where(eq(fixedCostInstallments.fixedCostId, cost.id));
        console.log(`Generated Installments Count: ${installments.length}`);

        if (installments.length > 0) {
            console.log(`First Installment Due: ${installments[0].dueDate}`);
            console.log(`Last Installment Due: ${installments[installments.length - 1].dueDate}`);
        } else {
            console.log("WARNING: No installments found!");
        }
    }
    process.exit(0);
}

checkData().catch(console.error);
