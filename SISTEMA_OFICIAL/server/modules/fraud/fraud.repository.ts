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
                baseline: analysis.baseline, // Persist baseline for PDF reports
                isPartialAnalysis: analysis.isPartialAnalysis || false
            },
            status: (existing ? existing.status : "pendente"),
            // Use shiftInicio (full timestamp) instead of date string to preserve timezone
            detectedAt: analysis.shiftInicio || (analysis.date ? new Date(analysis.date + "T12:00:00") : new Date()),
        };

        // AUTO-DISCARD: If Score is 0, status must be 'descartado' (unless already confirmed/archived)
        if (payload.riskScore === 0 && (!existing || existing.status === 'pendente' || existing.status === 'em_analise')) {
            payload.status = 'descartado';
        }

        if (existing) {
            // 🔴 NOVA VERIFICAÇÃO: Só atualiza se houver mudança relevante
            const existingMeta = existing.metadata as any || {};
            const hasRelevantChange =
                existingMeta.kmTotal !== analysis.kmTotal ||
                existingMeta.revenueTotal !== analysis.revenueTotal ||
                existing.riskScore !== analysis.score.totalScore;

            if (!hasRelevantChange) {
                // console.log(`⏭️ Turno ${analysis.shiftId.slice(0,8)} sem alterações, pulando atualização.`);
                return existing.id; // Não atualiza
            }

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
        const { limit = 50, offset = 0, status, driverId, startDate, endDate } = options;

        // Build WHERE clause dynamically using raw SQL for reliable date filtering
        let whereClause = sql`1=1`;

        if (status && status !== 'all') {
            if (status.includes(',')) {
                // FIXED: Validate status against allowed values to prevent SQL Injection
                const allowed = ['pendente', 'em_analise', 'confirmado', 'arquivado', 'falso_positivo'];
                const statusList = status.split(',')
                    .map(s => s.trim())
                    .filter(s => allowed.includes(s)) as any[];

                if (statusList.length > 0) {
                    whereClause = sql`${whereClause} AND ${inArray(fraudEvents.status, statusList)}`;
                }
            } else {
                whereClause = sql`${whereClause} AND ${eq(fraudEvents.status, status as any)}`;
            }
        }

        if (driverId && driverId !== 'all') {
            whereClause = sql`${whereClause} AND fraud_events.driver_id = ${driverId}`;
        }

        // Date filtering using detected_at
        if (startDate) {
            whereClause = sql`${whereClause} AND DATE(fraud_events.detected_at) >= ${startDate}::date`;
        }
        if (endDate) {
            whereClause = sql`${whereClause} AND DATE(fraud_events.detected_at) <= ${endDate}::date`;
        }

        console.log('[FRAUD-REPO] getFraudEvents:', { startDate, endDate, status, driverId });

        const result = await db.execute(sql`
            SELECT 
                id, shift_id as "shiftId", driver_id as "driverId",
                risk_score as "riskScore", risk_level as "riskLevel", status, 
                rules, metadata, detected_at as "detectedAt"
            FROM fraud_events
            WHERE ${whereClause}
            ORDER BY detected_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `);

        return result.rows;
    },

    async getEventsCount(options: { status?: string, driverId?: string, startDate?: string, endDate?: string } = {}) {
        const { status, driverId, startDate, endDate } = options;

        // Build raw SQL for count with date filters
        let whereClause = sql`1=1`;

        if (status && status !== 'all') {
            if (status.includes(',')) {
                // FIXED: Validate status against allowed values to prevent SQL Injection
                const allowed = ['pendente', 'em_analise', 'confirmado', 'arquivado', 'falso_positivo'];
                const statusList = status.split(',')
                    .map(s => s.trim())
                    .filter(s => allowed.includes(s)) as any[];

                if (statusList.length > 0) {
                    whereClause = sql`${whereClause} AND ${inArray(fraudEvents.status, statusList)}`;
                }
            } else {
                whereClause = sql`${whereClause} AND ${eq(fraudEvents.status, status as any)}`;
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

    async getFraudEventById(eventId: string) {
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

    async getDashboardStats() {
        // Optimization: Use direct SQL aggregation for performance
        const statsResult = await db.execute(sql`
            SELECT 
                AVG(risk_score) as avg_score,
                COUNT(*) FILTER (WHERE status = 'pendente' OR status = 'em_analise') as active_alerts,
                COUNT(*) FILTER (WHERE risk_level = 'high' OR risk_level = 'critical') as high_risk_count,
                COUNT(*) as processed_shifts
            FROM fraud_events
        `);

        const row = statsResult.rows[0] as any;

        return {
            riskScore: Number(Number(row.avg_score || 0).toFixed(1)),
            activeAlerts: Number(row.active_alerts || 0),
            processedShifts: Number(row.processed_shifts || 0),
            highRiskDrivers: Number(row.high_risk_count || 0)
        };
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
