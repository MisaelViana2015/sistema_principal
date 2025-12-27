import { db } from "../../core/db/connection.js";
import { fraudEvents } from "../../../shared/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { FraudShiftAnalysis } from "./fraud.types.js";

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
                revenuePerKm: analysis.revenuePerKm
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

    async getFraudEvents(limit = 50) {
        return await db.query.fraudEvents.findMany({
            orderBy: (f, { desc }) => desc(f.detectedAt),
            limit,
            with: {
                // Aqui poderíamos incluir relações se definidas no schema relations
            }
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

    async updateEventStatus(eventId: string, status: string, comment?: string) {
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
