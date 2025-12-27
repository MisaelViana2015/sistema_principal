import { db } from "../../core/db/connection.js";
import { fraudEvents } from "../../../shared/schema.js";
import { eq, desc, sql } from "drizzle-orm";
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

    async getFraudEvents(options: { limit?: number, offset?: number, status?: string } = {}) {
        const { limit = 50, offset = 0, status } = options;
        return await db.query.fraudEvents.findMany({
            where: (f, { eq, inArray }) => {
                if (status && status !== 'all') {
                    if (status.includes(',')) {
                        const statuses = status.split(',').map(s => s.trim());
                        return inArray(f.status, statuses);
                    }
                    return eq(f.status, status);
                }
                return undefined;
            },
            orderBy: (f, { desc }) => desc(f.detectedAt),
            limit,
            offset
        });
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
    }
};
