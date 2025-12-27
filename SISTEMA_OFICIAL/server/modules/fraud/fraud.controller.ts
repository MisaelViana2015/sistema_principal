import { Request, Response } from "express";
import { FraudService } from "./fraud.service.js";
import { FraudRepository } from "./fraud.repository.js";
import { db } from "../../core/db/connection.js";
import { fraudEvents } from "../../../shared/schema.js";
import { desc, eq, sql } from "drizzle-orm";
// Static imports for better performance
import { analyzeShiftRules } from "./fraud.engine.js";
import { generateEventPdf } from "./fraud.pdf.js";
import { randomUUID } from "node:crypto";

export const FraudController = {
    // POST /api/fraud/analyze/:shiftId
    async manualAnalyze(req: Request, res: Response) {
        try {
            const { shiftId } = req.params;
            const result = await FraudService.analyzeShift(shiftId);

            if (!result) {
                return res.status(404).json({ error: "Turno não encontrado ou inválido" });
            }

            res.json(result);
        } catch (error: any) {
            console.error("[FRAUD] Error analyzing shift:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/dashboard-stats
    async getDashboardStats(req: Request, res: Response) {
        try {
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

            res.json({
                riskScore: Number(Number(row.avg_score || 0).toFixed(1)),
                activeAlerts: Number(row.active_alerts || 0),
                processedShifts: Number(row.processed_shifts || 0),
                highRiskDrivers: Number(row.high_risk_count || 0)
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/heatmap
    async getHeatmapData(req: Request, res: Response) {
        try {
            // Optimization: Aggregate by date in SQL
            const result = await db.execute(sql`
                SELECT 
                    DATE(detected_at) as date,
                    COUNT(*) as count,
                    AVG(risk_score) as avg_score,
                    MAX(risk_score) as max_score
                FROM fraud_events
                WHERE detected_at >= NOW() - INTERVAL '1 year'
                GROUP BY DATE(detected_at)
                ORDER BY date
            `);

            const data = result.rows.map((row: any) => ({
                date: new Date(row.date).toISOString().split('T')[0], // YYYY-MM-DD
                count: Number(row.count),
                avgScore: Number(row.avg_score || 0),
                maxScore: Number(row.max_score || 0)
            }));

            res.json(data);
        } catch (error: any) {
            console.error("[FRAUD] Error getting heatmap data:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/alerts
    async getRecentAlerts(req: Request, res: Response) {
        try {
            const alerts = await FraudRepository.getFraudEvents({ limit: 10 });
            res.json(alerts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/events
    async getEventsList(req: Request, res: Response) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const statusQuery = req.query.status;
            const status = Array.isArray(statusQuery) ? statusQuery.join(',') : (statusQuery as string);
            const offset = (page - 1) * limit;

            const events = await FraudRepository.getFraudEvents({ limit, offset, status });

            // Fetch total count for pagination
            const whereClause = status ? sql`status = ${status}` : undefined;
            const countResult = await db.select({ count: sql<number>`count(*)` })
                .from(fraudEvents)
                .where(whereClause);

            const total = Number(countResult[0]?.count || 0);

            res.json({
                data: events,
                total,
                page,
                limit
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/analyze-all
    async analyzeAllShifts(req: Request, res: Response) {
        try {
            // Fetch all finished shifts
            const allShifts = await db.execute(sql`
                SELECT id FROM shifts WHERE status != 'em_andamento'
            `);

            const shifts = allShifts.rows as any[];
            let analyzed = 0;
            let errors = 0;
            const results: any[] = [];

            // Batch processing configuration to prevent server freeze
            const BATCH_SIZE = 50;

            for (let i = 0; i < shifts.length; i += BATCH_SIZE) {
                const batch = shifts.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (shift) => {
                    try {
                        const result = await FraudService.analyzeShift(shift.id);
                        if (result && result.score.totalScore > 0) {
                            results.push({
                                shiftId: shift.id.substring(0, 8),
                                score: result.score.totalScore,
                                level: result.score.level,
                                reasons: result.score.reasons.map((r: any) => r.label)
                            });
                        }
                        analyzed++;
                    } catch (err) {
                        errors++;
                        console.error(`Error processing shift ${shift.id}:`, err);
                    }
                }));

                // Small pause to yield to event loop
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            res.json({
                success: true,
                total: shifts.length,
                analyzed,
                errors,
                alertsFound: results.length,
                details: results.slice(0, 50) // Limit to top 50
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/preview/:shiftId
    async previewAnalysis(req: Request, res: Response) {
        try {
            const { shiftId } = req.params;

            const shift = await db.query.shifts.findFirst({
                where: (s, { eq }) => eq(s.id, shiftId)
            });

            if (!shift) {
                return res.status(404).json({ error: "Turno não encontrado" });
            }

            // Calculate current metrics
            const inicio = new Date(shift.inicio);
            const agora = new Date();
            const durationHours = Math.max(0.01, (agora.getTime() - inicio.getTime()) / (1000 * 60 * 60));

            // Fetch rides for the shift
            const ridesResult = await db.execute(sql`SELECT valor FROM rides WHERE shift_id = ${shift.id}`);
            const ridesData = ridesResult.rows as any[];

            let totalBruto = Number(shift.totalBruto || 0);
            let totalCorridas = Number(shift.totalCorridas || 0);
            let rideValues: number[] = [];

            if (ridesData.length > 0) {
                totalBruto = ridesData.reduce((acc, r) => acc + Number(r.valor), 0);
                totalCorridas = ridesData.length;
                rideValues = ridesData.map(r => Number(r.valor));
            }

            const score = analyzeShiftRules(
                Number(shift.kmInicial || 0),
                Number(shift.kmFinal || shift.kmInicial || 0),
                totalBruto,
                totalCorridas,
                durationHours,
                { baseline: null, prevShiftKmEnd: null }, // Simplified context for preview
                rideValues
            );

            res.json({
                shiftId,
                isPreview: true,
                score: score.totalScore,
                level: score.level,
                alerts: score.reasons.map((r: any) => ({
                    code: r.code,
                    label: r.label,
                    description: r.description,
                    severity: r.severity
                }))
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/event/:id
    async getEventDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const event = await FraudRepository.getEventById(id);

            if (!event) {
                return res.status(404).json({ error: "Evento de fraude não encontrado" });
            }

            if (!event.shiftId) {
                return res.status(404).json({ error: "Evento sem turno associado" });
            }

            const shift = await db.query.shifts.findFirst({
                where: (s, { eq }) => eq(s.id, event.shiftId as string)
            });

            if (!shift) {
                return res.status(404).json({ error: "Turno associado não encontrado" });
            }

            res.json({
                event,
                shift: {
                    id: shift.id,
                    driverId: shift.driverId,
                    vehicleId: shift.vehicleId,
                    inicio: shift.inicio,
                    fim: shift.fim,
                    kmInicial: Number(shift.kmInicial || 0),
                    kmFinal: Number(shift.kmFinal || 0),
                    totalBruto: Number(shift.totalBruto || 0),
                    totalCorridas: Number(shift.totalCorridas || 0),
                    duracaoMin: Number(shift.duracaoMin || 0)
                }
            });
        } catch (error: any) {
            console.error("[FRAUD] Error getting event detail:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/event/:id/status
    async updateEventStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, comment } = req.body;

            if (!status || status === 'pendente') {
                return res.status(400).json({ error: "Status inválido ou não fornecido." });
            }

            // Input Validation
            if (comment && typeof comment !== 'string') {
                return res.status(400).json({ error: "Comentário inválido." });
            }

            const validStatuses = ['em_analise', 'confirmado', 'descartado', 'bloqueado'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Status desconhecido." });
            }

            const currentEvent = await FraudRepository.getEventById(id);
            if (!currentEvent) {
                return res.status(404).json({ error: "Evento não encontrado." });
            }

            const updated = await FraudRepository.updateEventStatus(id, status, comment);
            res.json(updated);
        } catch (error: any) {
            console.error("[FRAUD] Error updating event status:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/seed
    async seedData(req: Request, res: Response) {
        try {
            // Clean old seed data to prevent duplicates
            try {
                // Remove data marked as seed in metadata
                await db.delete(fraudEvents)
                    .where(sql`metadata->>'seed' = 'true'`);
            } catch (e) {
                console.warn("Could not clean old seed data", e);
            }

            // Get recent shifts
            const recentShifts = await db.query.shifts.findMany({
                orderBy: (s, { desc }) => desc(s.inicio),
                limit: 50
            });

            if (recentShifts.length === 0) {
                return res.status(400).json({ error: "Nenhum turno encontrado para gerar dados." });
            }

            const eventsToCreate: any[] = [];
            const getRandomShift = () => recentShifts[Math.floor(Math.random() * recentShifts.length)];

            // Distribute over last 30 days
            const today = new Date();
            const levels = ['low', 'medium', 'high', 'critical'];

            for (let d = 0; d < 30; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - d);

                // 30% chance of event per day
                if (Math.random() > 0.3) {
                    const level = levels[Math.floor(Math.random() * levels.length)];
                    const shift = getRandomShift();

                    let score = 0;
                    const reasons = [];

                    switch (level) {
                        case 'low':
                            score = Math.floor(Math.random() * 30);
                            reasons.push({ code: 'RULE_01', label: 'Horário Atípico', description: 'Início fora do padrão', severity: 'low', score: 10 });
                            break;
                        case 'medium':
                            score = 30 + Math.floor(Math.random() * 30);
                            reasons.push({ code: 'RULE_02', label: 'Eficiência Baixa', description: 'Receita por KM abaixo do esperado', severity: 'medium', score: 40 });
                            break;
                        case 'high':
                            score = 60 + Math.floor(Math.random() * 20);
                            reasons.push({ code: 'RULE_03', label: 'Desvio de Rota', description: 'KM muito acima do padrão', severity: 'high', score: 70 });
                            break;
                        case 'critical':
                            score = 80 + Math.floor(Math.random() * 20);
                            reasons.push({ code: 'RULE_04', label: 'Inconsistência Grave', description: 'Valores não batem com hodômetro', severity: 'critical', score: 90 });
                            break;
                    }

                    eventsToCreate.push({
                        id: randomUUID(),
                        shiftId: shift.id,
                        driverId: shift.driverId,
                        vehicleId: shift.vehicleId,
                        riskScore: score,
                        riskLevel: level,
                        rules: reasons,
                        details: { reasons },
                        metadata: { seed: true, generatedAt: new Date() },
                        status: 'pendente',
                        detectedAt: date,
                        updatedAt: new Date()
                    });
                }
            }

            if (eventsToCreate.length > 0) {
                await db.insert(fraudEvents).values(eventsToCreate as any);
            }

            res.json({ success: true, count: eventsToCreate.length, message: "Dados de teste gerados com sucesso!" });
        } catch (error: any) {
            console.error("[FRAUD] Error seeding data:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/event/:id/pdf
    async getEventPdf(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const event = await FraudRepository.getEventById(id);

            if (!event) {
                return res.status(404).json({ error: "Evento não encontrado" });
            }

            if (!event.shiftId) {
                return res.status(404).json({ error: "Evento sem turno associado" });
            }

            const shift = await db.query.shifts.findFirst({
                where: (s, { eq }) => eq(s.id, event.shiftId as string)
            });

            if (!shift) {
                return res.status(404).json({ error: "Turno associado não encontrado" });
            }

            const pdfBuffer = await generateEventPdf(event, {
                id: shift.id,
                driverId: shift.driverId,
                vehicleId: shift.vehicleId,
                inicio: shift.inicio,
                fim: shift.fim,
                kmInicial: Number(shift.kmInicial || 0),
                kmFinal: Number(shift.kmFinal || 0),
                totalBruto: Number(shift.totalBruto || 0),
                totalCorridas: Number(shift.totalCorridas || 0),
                duracaoMin: Number(shift.duracaoMin || 0)
            });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=fraud-event-${event.id}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            console.error("[FRAUD] Error generating PDF:", error);
            res.status(500).json({ error: error.message });
        }
    }
};
