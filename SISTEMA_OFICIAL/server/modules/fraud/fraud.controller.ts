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

            const activeAlerts = allEvents.filter(e => e.status === 'pendente').length;

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
            // Agrupar eventos por dia
            const events = await db.execute(sql`
        SELECT 
          DATE(detected_at) as date,
          COUNT(*) as count
        FROM fraud_events
        WHERE detected_at > NOW() - INTERVAL '1 year'
        GROUP BY DATE(detected_at)
        ORDER BY date ASC
      `);

            const data = events.rows.map((row: any) => ({
                date: row.date,
                count: Number(row.count),
                details: []
            }));

            res.json(data);
        } catch (error: any) {
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

            if (ridesData.length > 0) {
                totalBruto = ridesData.reduce((acc, r) => acc + Number(r.valor), 0);
                totalCorridas = ridesData.length;
            }

            // Importar engine
            const { analyzeShiftRules } = await import("./fraud.engine.js");

            const score = analyzeShiftRules(
                Number(shift.kmInicial || 0),
                Number(shift.kmFinal || shift.kmInicial || 0), // Se null, assume 0 percorrido
                totalBruto,
                totalCorridas,
                durationHours,
                { baseline: null, prevShiftKmEnd: null } // Preview simplificado
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
    }
};
