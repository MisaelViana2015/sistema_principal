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
    }
};
