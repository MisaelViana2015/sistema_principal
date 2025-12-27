import { db } from "../../core/db/connection.js";
import { fraudEvents } from "../../../shared/schema.js";
import { eq, desc, sql, inArray } from "drizzle-orm";
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
            detectedAt: new Date(),
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

    async getFraudEvents(options: { limit?: number, offset?: number, status?: string, driverId?: string, vehicleId?: string } = {}) {
        const { limit = 50, offset = 0, status, driverId, vehicleId } = options;
        return await db.query.fraudEvents.findMany({
            where: (f, { eq, inArray, and }) => {
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
                // Note: vehicleId filtering on metadata jsonb is complex in drizzle query builder type-safe way.
                // We'll skip vehicleId for now or implement strict sql check if really needed.
                // if (vehicleId) ... 

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

    async getEventsCount(options: { status?: string, driverId?: string } = {}) {
        const { status, driverId } = options;

        const conditions = [];
        if (status && status !== 'all') {
            if (status.includes(',')) {
                const statuses = status.split(',').map(s => s.trim());
                conditions.push(inArray(fraudEvents.status, statuses));
            } else {
                conditions.push(eq(fraudEvents.status, status as FraudEventStatus));
            }
        }
        if (driverId) conditions.push(eq(fraudEvents.driverId, driverId));

        const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;

        const result = await db.execute(sql`SELECT COUNT(*) as count FROM fraud_events ${whereClause}`);
        return Number(result.rows[0].count);
    },

    async getPendingEventsCount() {
        const events = await db.query.fraudEvents.findMany({
            where: (f, { eq }) => eq(f.status, 'pendente')
        });
        return events.length;
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
