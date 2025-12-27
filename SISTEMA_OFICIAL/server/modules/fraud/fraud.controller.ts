import { Request, Response } from "express";
import { FraudService } from "./fraud.service.js";
import { FraudRepository } from "./fraud.repository.js";
import { db } from "../../core/db/connection.js";
import { fraudEvents } from "../../../shared/schema.js";
import { desc, eq, sql } from "drizzle-orm";

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
            // Stats reais
            const allEvents = await db.query.fraudEvents.findMany({
                orderBy: (f, { desc }) => desc(f.detectedAt),
                limit: 1000
            });

            const activeAlerts = allEvents.filter(e => e.status === 'pendente' || e.status === 'em_analise').length;

            const scoreSum = allEvents.reduce((acc, curr) => acc + (curr.riskScore || 0), 0);
            const avgScore = allEvents.length > 0 ? scoreSum / allEvents.length : 0;

            const highRiskCount = allEvents.filter(e =>
                e.riskLevel === 'high' || e.riskLevel === 'critical'
            ).length;

            // Mockado até termos tabela de controle de 'turnos processados total'
            // ou fazemos um count na tabela shifts
            const processedShifts = allEvents.length;

            res.json({
                riskScore: Number(avgScore.toFixed(1)),
                activeAlerts,
                processedShifts,
                highRiskDrivers: highRiskCount // Simplificação: count de eventos high risk
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/heatmap
    async getHeatmapData(req: Request, res: Response) {
        try {
            const { db } = await import("../../core/db/connection.js");
            const { sql } = await import("drizzle-orm");

            // Query otimizada para agrupar por dia
            // Retorna: date, count, avgScore, maxScore
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
            const alerts = await FraudRepository.getFraudEvents(10);
            res.json(alerts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/analyze-all
    async analyzeAllShifts(req: Request, res: Response) {
        try {
            const { db } = await import("../../core/db/connection.js");
            const { sql } = await import("drizzle-orm");

            // Buscar todos os turnos finalizados
            const allShifts = await db.execute(sql`
            SELECT id FROM shifts WHERE status != 'em_andamento'
        `);

            let analyzed = 0;
            let errors = 0;
            const results: any[] = [];

            for (const shift of allShifts.rows as any[]) {
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
                }
            }

            res.json({
                success: true,
                total: allShifts.rows.length,
                analyzed,
                errors,
                alertsFound: results.length,
                details: results.slice(0, 50) // Limitar a 50 resultados
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/preview/:shiftId
    async previewAnalysis(req: Request, res: Response) {
        try {
            const { shiftId } = req.params;

            // Usar o engine diretamente sem salvar
            const { db } = await import("../../core/db/connection.js");
            const shift = await db.query.shifts.findFirst({
                where: (s, { eq }) => eq(s.id, shiftId)
            });

            if (!shift) {
                return res.status(404).json({ error: "Turno não encontrado" });
            }

            // Calcular dados atuais
            const inicio = new Date(shift.inicio);
            const agora = new Date();
            const durationHours = Math.max(0.01, (agora.getTime() - inicio.getTime()) / (1000 * 60 * 60));

            // Dados parciais
            const kmTotal = Math.max(0, Number(shift.kmFinal || 0) - Number(shift.kmInicial || 0)); // Se kmFinal null, usa 0

            // Tratamento de segurança para dados numéricos
            let totalBruto = Number(shift.totalBruto || 0);
            let totalCorridas = Number(shift.totalCorridas || 0);

            // Buscar corridas atuais para garantir precisão no preview
            const { sql } = await import("drizzle-orm");
            const ridesResult = await db.execute(sql`SELECT valor FROM rides WHERE shift_id = ${shift.id}`);
            const ridesData = ridesResult.rows as any[];

            let rideValues: number[] = [];

            if (ridesData.length > 0) {
                totalBruto = ridesData.reduce((acc, r) => acc + Number(r.valor), 0);
                totalCorridas = ridesData.length;
                rideValues = ridesData.map(r => Number(r.valor));
            }

            // Importar engine
            const { analyzeShiftRules } = await import("./fraud.engine.js");

            const score = analyzeShiftRules(
                Number(shift.kmInicial || 0),
                Number(shift.kmFinal || shift.kmInicial || 0), // Se null, assume 0 percorrido
                totalBruto,
                totalCorridas,
                durationHours,
                { baseline: null, prevShiftKmEnd: null }, // Preview simplificado
                rideValues // Pass values for pattern detection
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

            // Buscar turno associado
            const { db } = await import("../../core/db/connection.js");
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
            const { db } = await import("../../core/db/connection.js");
            const { fraudEvents } = await import("../../../shared/schema.js");
            const { randomUUID } = await import("node:crypto");

            // Buscar turnos recentes
            const recentShifts = await db.query.shifts.findMany({
                orderBy: (s, { desc }) => desc(s.inicio),
                limit: 50
            });

            if (recentShifts.length === 0) {
                return res.status(400).json({ error: "Nenhum turno encontrado para gerar dados." });
            }

            const eventsToCreate: any[] = [];
            const getRandomShift = () => recentShifts[Math.floor(Math.random() * recentShifts.length)];

            // Distribuir nos últimos 30 dias
            const today = new Date();
            const levels = ['low', 'medium', 'high', 'critical'];
            const counts = { low: 5, medium: 4, high: 3, critical: 2 };

            for (let d = 0; d < 30; d++) {
                const date = new Date(today);
                date.setDate(date.getDate() - d);

                // Chance de ter evento no dia (70%)
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
                        status: 'pendente', // Sempre começa como pendente
                        detectedAt: date, // Data retroativa para heatmap
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

            const { db } = await import("../../core/db/connection.js");
            const shift = await db.query.shifts.findFirst({
                where: (s, { eq }) => eq(s.id, event.shiftId as string)
            });

            if (!shift) {
                return res.status(404).json({ error: "Turno associado não encontrado" });
            }

            const { generateEventPdf } = await import("./fraud.pdf.js");
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
