
import { db } from "../server/core/db/connection";
import { shifts } from "../shared/schema";
import { eq, isNull, and, or } from "drizzle-orm";

async function auditKm() {
    console.log("🔍 Auditing Shifts with missing KM Final...");

    try {
        const problematicShifts = await db.select().from(shifts).where(
            and(
                eq(shifts.status, 'finalizado'),
                or(
                    isNull(shifts.kmFinal),
                    eq(shifts.kmFinal, 0)
                )
            )
        );

        console.log(`Found ${problematicShifts.length} finalized shifts with missing or zero KM Final.`);

        if (problematicShifts.length > 0) {
            console.log("Example shifts:");
            problematicShifts.slice(0, 5).forEach(s => {
                console.log(`- ID: ${s.id}, Driver: ${s.driverId}, Date: ${s.inicio}, KM Init: ${s.kmInicial}, KM Final: ${s.kmFinal}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("Error during audit:", error);
        process.exit(1);
    }
}

auditKm();
