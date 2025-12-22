
import { db } from '../server/core/db/connection';
import { expenses, shifts, drivers } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

async function run() {
    console.log('🔍 Checking specific expenses...');

    // Check for dates seen in screenshot: 2025-11-27, 2025-11-24, 2025-11-22
    // Using string comparison for simplicity if DB dates are timestamps

    const results = await db.select({
        id: expenses.id,
        date: expenses.date,
        value: expenses.value,
        shiftId: expenses.shiftId,
        shiftExists: shifts.id,
        shiftDriverId: shifts.driverId,
        driverName: drivers.nome
    })
        .from(expenses)
        .leftJoin(shifts, eq(expenses.shiftId, shifts.id))
        .leftJoin(drivers, eq(shifts.driverId, drivers.id))
        .where(sql`to_char(${expenses.date}, 'YYYY-MM-DD') IN ('2025-11-27', '2025-11-24', '2025-11-22')`)
        .orderBy(expenses.date);

    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

run().catch(console.error);
