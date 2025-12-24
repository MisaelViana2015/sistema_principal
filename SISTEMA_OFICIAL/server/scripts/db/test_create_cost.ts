
import { createFixedCost } from '../../modules/financial/financial.repository.js';
import { db } from '../../core/db/connection.js';
import { fixedCosts, fixedCostInstallments } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';

async function test() {
    console.log("Creating Test Cost locally...");
    try {
        const cost = await createFixedCost({
            name: "Test Cost Logic",
            value: "150.00",
            totalInstallments: 5,
            startDate: new Date(),
            dueDay: 15,
            frequency: "Mensal",
            vehicleId: null,
            costTypeId: null
        });

        console.log(`Created Cost ID: ${cost.id}`);
        console.log(`Total Installments Requested: 5`);

        const installments = await db.select().from(fixedCostInstallments).where(eq(fixedCostInstallments.fixedCostId, cost.id));
        console.log(`Generated Installments Count: ${installments.length}`);

        if (installments.length === 5) {
            console.log("\n✅ SUCCESS: Installments generated correctly.");
        } else {
            console.log("\n❌ FAILURE: Installments missing or incorrect count.");
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
    process.exit(0);
}

test();
