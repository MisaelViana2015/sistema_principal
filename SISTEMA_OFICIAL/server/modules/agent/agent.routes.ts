/**
 * Agent Routes - Endpoints para o Agente IA Local
 * Fornece dados estruturados para análise automatizada
 */
import { Router } from "express";
import { db } from "../../core/db/connection.js";
import { shifts, rides, fraudEvents, drivers, vehicles } from "../../../shared/schema.js";
import { eq, desc, and, gte, isNull, isNotNull, sql } from "drizzle-orm";

const router = Router();

// ========== ENDPOINTS PÚBLICOS (para o agente local) ==========
// Nota: Em produção, adicionar autenticação via token

/**
 * GET /agent/health
 * Verifica se a API está respondendo
 */
router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * GET /agent/open-shifts-summary
 * Retorna resumo de turnos abertos para validação de cálculos
 */
router.get("/open-shifts-summary", async (req, res) => {
    try {
        const openShifts = await db.query.shifts.findMany({
            where: (s, { eq }) => eq(s.status, 'em_andamento'),
            with: {
                driver: { columns: { nome: true } },
                vehicle: { columns: { plate: true } }
            },
            orderBy: (s, { asc }) => asc(s.inicio),
            limit: 20
        });

        const summary = openShifts.map(s => ({
            shiftId: s.id.slice(0, 8),
            driver: s.driver?.nome || "Desconhecido",
            vehicle: s.vehicle?.plate || "N/A",
            startedAt: s.inicio,
            hoursOpen: s.inicio ? Math.round((Date.now() - new Date(s.inicio).getTime()) / 3600000) : 0,
            kmInicial: Number(s.kmInicial || 0),
            totalBruto: Number(s.totalBruto || 0),
            totalCorridas: Number(s.totalCorridas || 0)
        }));

        res.json({
            count: summary.length,
            shifts: summary,
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in open-shifts-summary:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agent/fraud-events?window=60
 * Retorna eventos de fraude recentes (últimas N horas)
 */
router.get("/fraud-events", async (req, res) => {
    try {
        const windowHours = parseInt(req.query.window as string) || 60;
        const cutoffDate = new Date(Date.now() - windowHours * 60 * 60 * 1000);

        const events = await db.query.fraudEvents.findMany({
            where: (e, { and, gte, eq }) => and(
                gte(e.detectedAt, cutoffDate),
                eq(e.status, 'pendente')
            ),
            orderBy: (e, { desc }) => desc(e.riskScore),
            limit: 10
        });

        // Enriquecer com dados do motorista
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const driver = event.driverId ? await db.query.drivers.findFirst({
                where: (d, { eq }) => eq(d.id, event.driverId as string),
                columns: { nome: true }
            }) : null;

            return {
                eventId: event.id.slice(0, 8),
                driverName: driver?.nome || "Desconhecido",
                riskScore: event.riskScore,
                riskLevel: event.riskLevel,
                status: event.status,
                detectedAt: event.detectedAt,
                rulesTriggered: (event.rules as any[])?.map(r => r.label || r.ruleId).join(", ") || "N/A"
            };
        }));

        res.json({
            windowHours,
            count: enrichedEvents.length,
            events: enrichedEvents,
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in fraud-events:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /agent/daily-summary
 * Resumo diário para análise geral
 */
router.get("/daily-summary", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Contagens básicas
        const [shiftsToday, ridesCount, fraudCount] = await Promise.all([
            db.select({ count: sql<number>`count(*)` })
                .from(shifts)
                .where(gte(shifts.inicio, today)),
            db.select({ count: sql<number>`count(*)` })
                .from(rides)
                .where(gte(rides.hora, today)),
            db.select({ count: sql<number>`count(*)` })
                .from(fraudEvents)
                .where(and(
                    gte(fraudEvents.detectedAt, today),
                    eq(fraudEvents.status, 'pendente')
                ))
        ]);

        res.json({
            date: today.toISOString().split('T')[0],
            shiftsStartedToday: Number(shiftsToday[0]?.count || 0),
            ridesToday: Number(ridesCount[0]?.count || 0),
            pendingFraudAlerts: Number(fraudCount[0]?.count || 0),
            generatedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[AGENT] Error in daily-summary:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
