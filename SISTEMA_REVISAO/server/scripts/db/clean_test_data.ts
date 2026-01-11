
import { db } from '../../core/db/connection.js';
import { fixedCosts, fixedCostInstallments } from '../../../shared/schema.js';
import { eq, or, like } from 'drizzle-orm';

async function cleanData() {
    console.log("Cleaning Test Data...");

    // Find costs to delete
    const costsToDelete = await db.select().from(fixedCosts).where(
        or(
            like(fixedCosts.name, '%Test Cost%'),
            like(fixedCosts.name, '%1111%'),
            like(fixedCosts.name, '%123%')
        )
    );

    console.log(`Found ${costsToDelete.length} test costs to delete.`);

    for (const cost of costsToDelete) {
        console.log(`Deleting Cost: ${cost.name} (ID: ${cost.id})`);

        // Delete installments first (FK constraint)
        await db.delete(fixedCostInstallments).where(eq(fixedCostInstallments.fixedCostId, cost.id));

        // Delete cost
        await db.delete(fixedCosts).where(eq(fixedCosts.id, cost.id));
    }

    console.log("Cleanup complete.");
    process.exit(0);
}

cleanData().catch(console.error);
