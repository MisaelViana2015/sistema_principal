
import { db } from "../../core/db/connection.js";
import { fraudEvents, drivers } from "../../../shared/schema.js";
import { eq, desc, count, sql } from "drizzle-orm";

export async function findAllFraudEvents() {
    return await db
        .select({
            id: fraudEvents.id,
            motorista: drivers.nome,
            driverId: fraudEvents.driverId,
            detectedAt: fraudEvents.detectedAt,
            score: fraudEvents.score,
            severity: fraudEvents.severity,
            triggeredRules: fraudEvents.triggeredRules,
            details: fraudEvents.details,
            resolved: fraudEvents.resolved,
        })
        .from(fraudEvents)
        .leftJoin(drivers, eq(fraudEvents.driverId, drivers.id))
        .orderBy(desc(fraudEvents.detectedAt));
}

export async function getFraudStats() {
    // Basic stats: count by severity
    const stats = await db
        .select({
            severity: fraudEvents.severity,
            count: count(fraudEvents.id),
        })
        .from(fraudEvents)
        .groupBy(fraudEvents.severity);

    return stats;
}

export async function getDriverRiskRanking() {
    // Aggregating risk by driver
    return await db
        .select({
            driverId: drivers.id,
            motorista: drivers.nome,
            totalEvents: count(fraudEvents.id),
            maxScore: sql<number>`MAX(${fraudEvents.score})`,
            avgScore: sql<number>`AVG(${fraudEvents.score})`,
        })
        .from(fraudEvents)
        .leftJoin(drivers, eq(fraudEvents.driverId, drivers.id))
        .groupBy(drivers.id, drivers.nome)
        .orderBy(desc(sql`MAX(${fraudEvents.score})`));
}
