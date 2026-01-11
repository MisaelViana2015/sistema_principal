
import { db } from '../core/db/connection';
import { shifts } from '../core/db/schema'; // Updated import based on standard drizzle usage
import { eq } from 'drizzle-orm';
import { FraudService } from '../modules/fraud/fraud.service';

async function runAnalysis() {
    console.log('Starting manual fraud analysis...');

    try {
        // Fetch all completed shifts
        // Note: interacting with 'db.query.shifts' might require looking at how schema is exported in core/db
        // Assuming standard drizzle setup, often schema is passed to drizzle()

        // Let's use the query builder pattern if possible, or sql
        // But FraudService.analyzeShift needs the shift ID.

        // We'll try to find shifts using the query builder
        const completedShifts = await db.query.shifts.findMany({
            where: (shifts, { eq }) => eq(shifts.status, 'concluido')
        });

        console.log(`Found ${completedShifts.length} completed shifts to analyze.`);

        let processed = 0;
        let errors = 0;

        for (const shift of completedShifts) {
            try {
                process.stdout.write(`Analyzing shift ${shift.id}... `);
                await FraudService.analyzeShift(shift.id);
                console.log('OK');
                processed++;
            } catch (err: any) {
                console.log(`ERROR: ${err.message}`);
                errors++;
            }
        }

        console.log('-----------------------------------');
        console.log(`Analysis complete.`);
        console.log(`Processed: ${processed}`);
        console.log(`Errors: ${errors}`);

        process.exit(0);
    } catch (error) {
        console.error('Fatal error running analysis:', error);
        process.exit(1);
    }
}

runAnalysis();
