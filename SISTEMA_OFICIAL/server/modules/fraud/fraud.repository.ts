import { db } from "../../core/db/connection.js";
import { fraudEvents } from "../../../shared/schema.js";
import { eq, desc, sql, inArray, and } from "drizzle-orm";
import { FraudShiftAnalysis, FraudEventStatus } from "./fraud.types.js";

export const FraudRepository = {
    async saveFraudEvent(analysis: FraudShiftAnalysis) {
        // Verifica se já existe evento para este turno
        const existing = await db.query.fraudEvents.findFirst({
            where: (f, { eq }) => eq(f.shiftId, analysis.shiftId)
        });

        const payload = {
            shiftId: analysis.shiftId,
            driverId: analysis.driverId,
            rideId: null,
            riskScore: analysis.score.totalScore,
            riskLevel: analysis.score.level,
            rules: analysis.score.reasons, // Drizzle automaticamente converte para JSONB
            metadata: {
                vehicleId: analysis.vehicleId,
                date: analysis.date,
                kmTotal: analysis.kmTotal,
                revenueTotal: analysis.revenueTotal,
                revenuePerKm: analysis.revenuePerKm,
                baseline: analysis.baseline // Persist baseline for PDF reports
            },
            status: existing ? existing.status : "pendente",
            detectedAt: analysis.date ? new Date(analysis.date) : new Date(),
        };

        if (existing) {
            await db
                .update(fraudEvents)
                .set(payload)
                .where(eq(fraudEvents.id, existing.id));
            return existing.id;
        } else {
            const [created] = await db.insert(fraudEvents).values(payload).returning();
            return created.id;
        }
    },

    async getFraudEvents(options: { limit?: number, offset?: number, status?: string, driverId?: string, vehicleId?: string, date?: string, startDate?: string, endDate?: string } = {}) {
        const { limit = 50, offset = 0, status, driverId, vehicleId, date, startDate, endDate } = options;
        return await db.query.fraudEvents.findMany({
            where: (f, { eq, inArray, and, sql }) => {
                const conditions = [];

                if (status && status !== 'all') {
                    if (status.includes(',')) {
                        const statuses = status.split(',').map(s => s.trim());
                        conditions.push(inArray(f.status, statuses));
                    } else {
                        conditions.push(eq(f.status, status as FraudEventStatus));
                    }
                }

                if (driverId) conditions.push(eq(f.driverId, driverId));

                // Filter by date - use detected_at directly with proper date casting
                if (startDate) {
                    conditions.push(sql`DATE(${f.detectedAt}) >= ${startDate}::date`);
                }
                if (endDate) {
                    conditions.push(sql`DATE(${f.detectedAt}) <= ${endDate}::date`);
                }

                return conditions.length > 0 ? and(...conditions) : undefined;
            },
            with: {
                driver: true
            },
            orderBy: (f, { desc }) => [desc(f.detectedAt)],
            limit,
            offset
        });
    },

    async getEventsCount(options: { status?: string, driverId?: string, startDate?: string, endDate?: string } = {}) {
        const { status, driverId, startDate, endDate } = options;

        // Build raw SQL for count with date filters
        let whereClause = sql`1=1`;

        if (status && status !== 'all') {
            if (status.includes(',')) {
                const statuses = status.split(',').map(s => `'${s.trim()}'`).join(',');
                whereClause = sql`${whereClause} AND status IN (${sql.raw(statuses)})`;
            } else {
                whereClause = sql`${whereClause} AND status = ${status}`;
            }
        }

        if (driverId) {
            whereClause = sql`${whereClause} AND driver_id = ${driverId}`;
        }

        if (startDate) {
            whereClause = sql`${whereClause} AND DATE(detected_at) >= ${startDate}::date`;
        }
        if (endDate) {
            whereClause = sql`${whereClause} AND DATE(detected_at) <= ${endDate}::date`;
        }

        const result = await db.execute(sql`SELECT count(*) as count FROM fraud_events WHERE ${whereClause}`);
        return Number(result.rows[0]?.count || 0);
    },

    async getPendingEventsCount() {
        // Use efficient count query instead of loading all records
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(fraudEvents)
            .where(eq(fraudEvents.status, 'pendente'));

        return Number(result[0]?.count || 0);
    },

    async getEventById(eventId: string) {
        return await db.query.fraudEvents.findFirst({
            where: (f, { eq }) => eq(f.id, eventId),
        });
    },

    async updateEventStatus(eventId: string, status: FraudEventStatus, comment?: string) {
        // Buscar evento atual para preservar metadata
        const current = await db.query.fraudEvents.findFirst({
            where: (f, { eq }) => eq(f.id, eventId)
        });

        if (!current) {
            throw new Error("Evento não encontrado");
        }

        // Atualizar metadata com comentário, preservando dados existentes
        const updatedMetadata = {
            ...(current.metadata as object || {}),
            comment: comment || null,
            lastDecisionAt: new Date().toISOString()
        };

        const [updated] = await db
            .update(fraudEvents)
            .set({
                status: status as any,
                metadata: updatedMetadata
            })
            .where(eq(fraudEvents.id, eventId))
            .returning();

        return updated;
    },

    async getTopRiskyDrivers(limit: number = 5) {
        const result = await db.execute(sql`
            SELECT 
                driver_id as "driverId",
                COUNT(*) as "totalEvents",
                AVG(risk_score) as "avgScore",
                SUM(CASE WHEN risk_level = 'critical' THEN 1 ELSE 0 END) as "criticalCount"
            FROM fraud_events
            GROUP BY driver_id
            HAVING COUNT(*) > 0
            ORDER BY "avgScore" DESC
            LIMIT ${limit}
        `);
        return result.rows;
    }
};
