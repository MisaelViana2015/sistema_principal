import { Request, Response } from "express";
import { FraudService } from "./fraud.service.js";
import { FraudRepository } from "./fraud.repository.js";
import { db } from "../../core/db/connection.js";
import { desc, eq, sql } from "drizzle-orm";
import { fraudEvents, shifts } from "../../../shared/schema.js";
import { calculateAuditMetrics } from "./fraud.audit.service.js";
// Static imports for better performance
import { generateEventPdf } from "./fraud.pdf.js";
import { randomUUID } from "node:crypto";
import { auditService } from "../../core/audit/audit.service.js";


// Simple in-memory status tracker (sufficient for maintenance tasks)
let batchStatus = {
    isRunning: false,
    processed: 0,
    total: 0,
    errors: 0,
    lastError: null as string | null,
    startTime: null as number | null,
    duration: null as string | null
};

export const FraudController = {
    // POST /api/fraud/analyze/:shiftId
    async manualAnalyze(req: Request, res: Response) {
        try {
            const { shiftId } = req.params;

            // AUDIT: Log manual trigger
            const context = req.auditContext || { ...auditService.createSystemContext('manual-analyze'), ip: req.ip };
            await auditService.logAction({
                action: 'TRIGGER_ANALYSIS',
                entity: 'shifts',
                entityId: shiftId,
                context
            });

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
            const stats = await FraudRepository.getDashboardStats();
            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/heatmap
    async getHeatmapData(req: Request, res: Response) {
        try {
            const driverId = req.query.driverId as string;

            // Build WHERE clause dynamically
            let whereClause = sql`fe.detected_at >= NOW() - INTERVAL '1 year'`;
            if (driverId && driverId !== 'all') {
                whereClause = sql`fe.detected_at >= NOW() - INTERVAL '1 year' AND fe.driver_id = ${driverId}`;
            }

            const result = await db.execute(sql`
                SELECT 
                    DATE(s.inicio)::text as date,
                    COUNT(*) as count,
                    AVG(fe.risk_score) as avg_score,
                    MAX(fe.risk_score) as max_score
                FROM fraud_events fe
                JOIN shifts s ON fe.shift_id = s.id
                WHERE ${whereClause}
                GROUP BY 1
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
            // Parse query parameters
            const limit = Number(req.query.limit) || 30;
            const page = Number(req.query.page) || 1;
            const offset = (page - 1) * limit;
            const driverId = req.query.driverId as string;
            const status = req.query.status as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            // Default status filter for active alerts
            const statusFilter = status && status !== 'all' ? status : 'pendente,em_analise,confirmado';

            // DEBUG: Log date filter params
            console.log('[FRAUD] Date filter params:', { startDate, endDate, status: statusFilter, driverId });

            const alerts = await FraudRepository.getFraudEvents({
                limit,
                offset,
                status: statusFilter,
                driverId,
                startDate,
                endDate
            });

            // MANUAL JOIN: Fetch drivers to ensure names are displayed
            if (alerts.length > 0) {
                const driverIds = [...new Set(alerts.map(a => a.driverId).filter(Boolean))] as string[];
                if (driverIds.length > 0) {
                    const driversFound = await db.query.drivers.findMany({
                        where: (d, { inArray }) => inArray(d.id, driverIds),
                        columns: { id: true, nome: true }
                    });

                    const driverMap = new Map(driversFound.map(d => [d.id, d]));

                    alerts.forEach((alert: any) => {
                        if (alert.driverId && driverMap.has(alert.driverId)) {
                            alert.driver = {
                                name: driverMap.get(alert.driverId)?.nome
                            };
                        }
                    });
                }
            }

            // Get total count for pagination (now includes date filters)
            const total = await FraudRepository.getEventsCount({
                status: statusFilter,
                driverId,
                startDate,
                endDate
            });

            console.log('[FRAUD] Query result:', { alertsCount: alerts.length, total, startDate, endDate });

            res.json({
                data: alerts,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: any) {
            console.error("[FRAUD] Erro ao buscar alertas:", error);
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
            const driverId = req.query.driverId as string;
            const offset = (page - 1) * limit;

            const events = await FraudRepository.getFraudEvents({ limit, offset, status, driverId });

            // MANUAL JOIN
            if (events.length > 0) {
                const dIds = [...new Set(events.map(e => e.driverId).filter(Boolean))] as string[];
                if (dIds.length > 0) {
                    const driversList = await db.query.drivers.findMany({
                        where: (d, { inArray }) => inArray(d.id, dIds),
                        columns: { id: true, nome: true }
                    });
                    const dMap = new Map(driversList.map(d => [d.id, d]));

                    events.forEach((event: any) => {
                        if (event.driverId && dMap.has(event.driverId)) {
                            event.driver = {
                                name: dMap.get(event.driverId)?.nome
                            };
                        }
                    });
                }
            }

            const total = await FraudRepository.getEventsCount({ status, driverId });

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

    // POST /api/fraud/analyze-today-open - Análise em tempo real de turnos abertos
    async analyzeTodayOpenShifts(req: Request, res: Response) {
        try {
            console.log("🔄 Analisando turnos abertos de hoje...");

            // Busca turnos em andamento de hoje
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const openShiftsResult = await db.execute(sql`
                SELECT id FROM shifts 
                WHERE status = 'em_andamento' 
                AND inicio >= ${today.toISOString()}
            `);

            const openShifts = openShiftsResult.rows as any[];
            let analyzed = 0;
            let errors = 0;
            const results: any[] = [];

            for (const shift of openShifts) {
                try {
                    const result = await FraudService.analyzeShift(shift.id);
                    if (result) {
                        results.push({
                            shiftId: shift.id.substring(0, 8),
                            score: result.score.totalScore,
                            level: result.score.level,
                            reasons: result.score.reasons.map((r: any) => r.label)
                        });
                        analyzed++;
                    }
                } catch (err) {
                    errors++;
                    console.error(`Error processing open shift ${shift.id}:`, err);
                }
            }

            res.json({
                success: true,
                message: "Análise em tempo real concluída",
                total: openShifts.length,
                analyzed,
                errors,
                alertsFound: results.filter((r: any) => r.score > 0).length,
                details: results
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/preview/:shiftId
    async previewAnalysis(req: Request, res: Response) {
        try {
            const { shiftId } = req.params;
            const preview = await FraudService.generatePreview(shiftId);
            res.json(preview);
        } catch (error: any) {
            console.error("Erro ao gerar preview:", error);
            res.status(500).json({ error: error.message || "Erro interno ao gerar preview" });
        }
    },

    // GET /api/fraud/event/:id
    async getEventDetail(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const event = await FraudRepository.getFraudEventById(id);

            if (!event) {
                return res.status(404).json({ error: "Evento de fraude não encontrado" });
            }

            if (!event.shiftId) {
                return res.status(404).json({ error: "Evento sem turno associado" });
            }

            let shiftData = await db.query.shifts.findFirst({
                where: (s, { eq }) => eq(s.id, event.shiftId as string)
            });

            // FALLBACK GRACEFUL PARA EVENTOS ÓRFÃOS
            if (!shiftData) {
                console.warn(`[FRAUD] Evento ${id} possui turno órfão ${event.shiftId}. Usando fallback de metadata.`);
                const meta = event.metadata as any || {};
                const fallbackDate = event.detectedAt ? event.detectedAt.toISOString() : new Date().toISOString();

                // Reconstrói um objeto de turno "falso" apenas para visualização
                shiftData = {
                    id: event.shiftId as string,
                    driverId: event.driverId as string,
                    vehicleId: meta.vehicleId || 'desconhecido',
                    inicio: meta.date ? new Date(meta.date + "T00:00:00").toISOString() : fallbackDate,
                    fim: meta.date ? new Date(meta.date + "T23:59:59").toISOString() : fallbackDate,
                    totalBruto: meta.revenueTotal || "0",
                    totalCorridas: 0,
                    kmInicial: "0",
                    kmFinal: String(meta.kmTotal || 0),
                    status: "excluido_ou_nao_encontrado" // Sinalizador visual
                } as any;
            }

            // At this point, shiftData is guaranteed to be defined
            const shift = shiftData!;

            // Fetch Driver and Vehicle Details
            const driver = await db.query.drivers.findFirst({
                where: (d, { eq }) => eq(d.id, shift.driverId),
                columns: { nome: true }
            });

            const vehicle = await db.query.vehicles.findFirst({
                where: (v, { eq }) => eq(v.id, shift.vehicleId),
                columns: { plate: true, modelo: true }
            });

            // EXPLICIT CALCULATION FROM RIDES (MANDATORY REQUIREMENT)
            const ridesRaw = await db.execute(sql`SELECT tipo, valor FROM rides WHERE shift_id = ${shift.id}`);
            const ridesList = ridesRaw.rows as any[];

            let ridesAppCount = 0;
            let ridesParticularCount = 0;
            let revenueApp = 0;
            let revenueParticular = 0;

            let ridesUnknownCount = 0;
            let revenueUnknown = 0;

            ridesList.forEach(r => {
                const rawType = (r.tipo || '').toUpperCase();
                const val = Number(r.valor || 0);

                if (['APP', 'APLICATIVO'].includes(rawType)) {
                    ridesAppCount++;
                    revenueApp += val;
                } else if (rawType === 'PARTICULAR') {
                    ridesParticularCount++;
                    revenueParticular += val;
                } else {
                    ridesUnknownCount++;
                    revenueUnknown += val;
                }
            });

            // --- AUDIT ENRICHMENT (PHASE 2) ---
            // Calculate strict operational metrics (Time Slots, Gaps, Baseline)
            // This does NOT affect the fraud engine or risk score.
            let auditMetrics = null;
            try {
                // Calculate share particular for contextual score
                const shareParticular = Number(shift.totalBruto || 0) > 0
                    ? (revenueParticular / Number(shift.totalBruto)) * 100
                    : 0;

                auditMetrics = await calculateAuditMetrics(
                    shift.id,
                    shift.driverId,
                    {
                        inicio: shift.inicio,
                        fim: shift.fim,
                        totalBruto: Number(shift.totalBruto || 0),
                        totalCorridas: Number(shift.totalCorridas || 0),
                        kmInicial: Number(shift.kmInicial || 0),
                        kmFinal: Number(shift.kmFinal || 0),
                        duracaoMin: Number(shift.duracaoMin || 0)
                    },
                    event.riskScore || 0,
                    shareParticular
                );
            } catch (auditError) {
                console.error("[FRAUD] Error calculating audit metrics:", auditError);
                // Non-blocking error - return null metrics
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
                    duracaoMin: Number(shift.duracaoMin || 0),
                    // New Explicit Aggregations
                    ridesAppCount,
                    ridesParticularCount,
                    ridesUnknownCount,
                    revenueApp,
                    revenueParticular,
                    revenueUnknown,
                    // Identity Details
                    driverName: driver?.nome || "Desconhecido",
                    vehiclePlate: vehicle?.plate || "Desconhecido",
                    vehicleModel: vehicle?.modelo || ""
                },
                auditMetrics // Injecting Audit Metrics for Phase 2
            });
        } catch (error: any) {
            console.error("[FRAUD] Error getting event detail:", error);
            res.status(500).json({ error: error.message });
        }
    },



    // ...

    // POST /api/fraud/event/:id/status
    async updateEventStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status, comment } = req.body;

            // ... validation ...
            if (!status || status === 'pendente') {
                return res.status(400).json({ error: "Status inválido ou não fornecido." });
            }
            if (comment && typeof comment !== 'string') {
                return res.status(400).json({ error: "Comentário inválido." });
            }

            const validStatuses = ['em_analise', 'confirmado', 'descartado', 'bloqueado'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Status desconhecido." });
            }

            const currentEvent = await FraudRepository.getFraudEventById(id);
            if (!currentEvent) {
                return res.status(404).json({ error: "Evento não encontrado." });
            }

            // USE WITH AUDIT
            const performUpdate = async () => {
                return await FraudRepository.updateEventStatus(id, status, comment);
            };

            const updated = await auditService.withAudit({
                action: 'UPDATE_FRAUD_STATUS',
                entity: 'fraud_events',
                entityId: id,
                operation: 'UPDATE',
                context: req.auditContext || { ...auditService.createSystemContext('fraud-update'), ip: req.ip },
                fetchBefore: () => FraudRepository.getFraudEventById(id),
                execute: performUpdate, // This actually returns the updated record
                fetchAfter: () => FraudRepository.getFraudEventById(id)
            });

            res.json(updated);
        } catch (error: any) {
            console.error("[FRAUD] Error updating event status:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/seed
    async seedData(req: Request, res: Response) {
        try {
            // AUDIT: Log seed trigger
            const context = req.auditContext || { ...auditService.createSystemContext('seed-data'), ip: req.ip };
            await auditService.logAction({
                action: 'SEED_DATA',
                entity: 'system',
                entityId: 'n/a',
                context
            });

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
                        // vehicleId removed: column does not exist in fraud_events table
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
            const data = await FraudService.getEventPdfData(id);

            // Re-calculate aggregations and metrics for PDF generation (Presentation Logic remains in controler or can be moved to a helper)
            // Ideally, the Service returns RAW data, and the Controller/PDF Generator handles formatting.
            // For now, let's keep the heavy lifting in the service but we need to pass data to generateEventPdf

            // Calculate audit metrics for PDF
            let auditMetrics = null;

            // Aggregation Variables
            let ridesAppCount = 0;
            let ridesParticularCount = 0;
            let ridesUnknownCount = 0;
            let revenueApp = 0;
            let revenueParticular = 0;
            let revenueUnknown = 0;

            try {
                // Full Aggregation Logic
                data.rides.forEach((ride: any) => {
                    const rawType = (ride.tipo || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const val = Number(ride.valor || 0);

                    if (rawType === 'app') {
                        ridesAppCount++;
                        revenueApp += val;
                    } else if (rawType === 'particular') {
                        ridesParticularCount++;
                        revenueParticular += val;
                    } else {
                        ridesUnknownCount++;
                        revenueUnknown += val;
                    }
                });

                const shareParticular = Number(data.shift.totalBruto || 0) > 0
                    ? (revenueParticular / Number(data.shift.totalBruto)) * 100
                    : 0;

                auditMetrics = await calculateAuditMetrics(
                    data.shift.id,
                    data.shift.driverId,
                    {
                        inicio: data.shift.inicio,
                        fim: data.shift.fim,
                        totalBruto: Number(data.shift.totalBruto || 0),
                        totalCorridas: Number(data.shift.totalCorridas || 0),
                        kmInicial: Number(data.shift.kmInicial || 0),
                        kmFinal: Number(data.shift.kmFinal || 0),
                        duracaoMin: Number(data.shift.duracaoMin || 0)
                    },
                    data.event.riskScore || 0,
                    shareParticular
                );
            } catch (auditError) {
                console.error("[FRAUD] PDF: Error calculating audit metrics:", auditError);
            }

            const pdfBuffer = await generateEventPdf(data.event, {
                id: data.shift.id,
                driverId: data.shift.driverId,
                vehicleId: data.shift.vehicleId,
                inicio: data.shift.inicio,
                fim: data.shift.fim,
                kmInicial: Number(data.shift.kmInicial || 0),
                kmFinal: Number(data.shift.kmFinal || 0),
                totalBruto: Number(data.shift.totalBruto || 0),
                totalCorridas: Number(data.shift.totalCorridas || 0),
                duracaoMin: Number(data.shift.duracaoMin || 0),
                // Breakdown Data
                ridesAppCount,
                ridesParticularCount,
                revenueApp,
                revenueParticular,
                ridesUnknownCount,
                revenueUnknown,
                // Audit Metrics
                auditMetrics
            });

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=fraud-event-${data.event.id}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            console.error("[FRAUD] Error generating PDF:", error);
            if (error.message === "Evento não encontrado") {
                return res.status(404).json({ error: "Evento não encontrado" });
            }
            res.status(500).json({ error: error.message });
        }
    },

    async getTopDrivers(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 5;
            const topDrivers = await FraudRepository.getTopRiskyDrivers(limit);
            res.json(topDrivers);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Phase 4: Behavior Change Analysis
    async checkBehaviorChange(req: Request, res: Response) {
        try {
            const { driverId } = req.params;

            // 1. Find First Confirmed Fraud
            const firstFraud = await db.query.fraudEvents.findFirst({
                where: (f, { and, eq }) => and(eq(f.driverId, driverId), eq(f.status, 'confirmado')),
                orderBy: (f, { asc }) => asc(f.detectedAt)
            });

            if (!firstFraud || !firstFraud.detectedAt) {
                return res.json({ hasCorrection: false, message: "Sem eventos de fraude confirmados para análise." });
            }

            const incidentDate = new Date(firstFraud.detectedAt);

            // 2. Fetch Shifts Before and After
            const shifts = await db.query.shifts.findMany({
                where: (s, { eq }) => eq(s.driverId, driverId),
                orderBy: (s, { asc }) => asc(s.inicio)
            });

            const beforeShifts = [];
            const afterShifts = [];

            for (const s of shifts) {
                const sDate = new Date(s.inicio);
                const diffDays = (sDate.getTime() - incidentDate.getTime()) / (1000 * 3600 * 24);

                if (diffDays >= -30 && diffDays < 0) beforeShifts.push(s);
                if (diffDays > 0 && diffDays <= 30) afterShifts.push(s);
            }

            // 3. Compare Metrics
            const calcMetrics = (list: any[]) => {
                let totalRides = 0;
                let totalHours = 0;
                list.forEach(s => {
                    totalRides += Number(s.totalCorridas || 0);
                    const dur = Math.max(0.1, (new Date(s.fim).getTime() - new Date(s.inicio).getTime()) / 3600000);
                    totalHours += dur;
                });
                return totalHours > 0 ? (totalRides / totalHours) : 0;
            };

            const statsBefore = calcMetrics(beforeShifts);
            const statsAfter = calcMetrics(afterShifts);

            const improvement = statsBefore > 0 ? ((statsAfter - statsBefore) / statsBefore) * 100 : 0;

            res.json({
                hasCorrection: statsAfter > statsBefore,
                incidentDate: incidentDate.toISOString(),
                statsBefore: statsBefore.toFixed(2),
                statsAfter: statsAfter.toFixed(2),
                improvementPercent: improvement.toFixed(1),
                shiftsInvolved: { before: beforeShifts.length, after: afterShifts.length }
            });

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // Phase 6: Manual External Evidence
    async addExternalEvidence(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { externalEvidence, evidenceType, externalRideCount } = req.body;

            await db.update(fraudEvents)
                .set({
                    externalEvidence: externalEvidence || null, // JSON string
                    evidenceType: evidenceType || null,
                    externalRideCount: externalRideCount ? Number(externalRideCount) : 0,
                    reviewedAt: new Date(), // Mark as touched
                })
                .where(eq(fraudEvents.id, id));

            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/fraud/reprocess-status
    async getBatchStatus(req: Request, res: Response) {
        res.json(batchStatus);
    },

    // GET /api/fraud/reprocess-preview
    async getReprocessPreview(req: Request, res: Response) {
        try {
            const result = await db.execute(sql`
                SELECT 
                    COUNT(*) as total,
                    MIN(inicio) as min_date,
                    MAX(inicio) as max_date
                FROM shifts
                WHERE status = 'finalizado'
            `);

            const stats = result.rows[0] as any;
            const total = Number(stats.total) || 0;
            const estimatedSeconds = Math.ceil(total * 0.3);

            res.json({
                action: "preview",
                totalShifts: total,
                dateRange: stats.min_date && stats.max_date
                    ? `${new Date(stats.min_date).toLocaleDateString('pt-BR')} - ${new Date(stats.max_date).toLocaleDateString('pt-BR')}`
                    : "N/A",
                estimatedTime: estimatedSeconds > 60
                    ? `~${Math.ceil(estimatedSeconds / 60)} minutos`
                    : `~${estimatedSeconds} segundos`,
                message: `Serão reprocessados ${total} turnos finalizados`
            });
        } catch (error: any) {
            console.error("[FRAUD] Erro no preview:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/reprocess-all
    async reprocessAllShifts(req: Request, res: Response) {
        if (batchStatus.isRunning) {
            return res.status(409).json({ error: "Já existe um reprocessamento em andamento." });
        }

        try {
            // AUDIT: Log batch reprocess trigger
            const context = req.auditContext || { ...auditService.createSystemContext('batch-reprocess'), ip: req.ip };
            await auditService.logAction({
                action: 'TRIGGER_BATCH_REPROCESS',
                entity: 'system',
                entityId: 'all',
                context
            });

            const allShifts = await db.execute(sql`
                SELECT id FROM shifts WHERE status = 'finalizado'
            `);
            const shifts = allShifts.rows as any[];

            if (shifts.length === 0) {
                return res.json({ message: "Nenhum turno para processar." });
            }

            batchStatus = {
                isRunning: true,
                processed: 0,
                total: shifts.length,
                errors: 0,
                lastError: null,
                startTime: Date.now(),
                duration: null
            };

            res.json({
                message: "Reprocessamento iniciado em background.",
                totalShifts: shifts.length,
                checkStatusUrl: "/api/fraud/reprocess-status"
            });

            setImmediate(async () => {
                const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                console.log(`[FRAUD BATCH] Iniciando com ${shifts.length} turnos...`);

                for (const shift of shifts) {
                    try {
                        await FraudService.analyzeShift(shift.id);
                        batchStatus.processed++;
                        if (batchStatus.processed % 10 === 0) await wait(50);
                    } catch (err: any) {
                        batchStatus.errors++;
                        batchStatus.lastError = `Shift ${shift.id}: ${err.message}`;
                        console.error(`[FRAUD BATCH] Erro ${shift.id}:`, err.message);
                    }
                }

                const durationSeconds = Math.round((Date.now() - (batchStatus.startTime || 0)) / 1000);
                batchStatus.isRunning = false;
                batchStatus.duration = `${durationSeconds}s`;
                console.log(`[FRAUD BATCH] Concluído: ${batchStatus.processed} ok, ${batchStatus.errors} erros em ${durationSeconds}s`);
            });

        } catch (error: any) {
            console.error("[FRAUD BATCH] Erro ao iniciar:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/fraud/run-migration - Protected migration endpoint
    async runMigration(req: Request, res: Response) {
        try {
            console.log("[MIGRATION] Starting fraud_events schema migration...");

            // Add the 3 new columns for external evidence (IF NOT EXISTS for safety)
            await db.execute(sql`
                ALTER TABLE fraud_events ADD COLUMN IF NOT EXISTS external_evidence TEXT;
            `);
            await db.execute(sql`
                ALTER TABLE fraud_events ADD COLUMN IF NOT EXISTS evidence_type TEXT;
            `);
            await db.execute(sql`
                ALTER TABLE fraud_events ADD COLUMN IF NOT EXISTS external_ride_count INTEGER;
            `);

            console.log("[MIGRATION] ✅ Migration completed successfully!");

            res.json({
                success: true,
                message: "Migration completed. Added columns: external_evidence, evidence_type, external_ride_count",
                timestamp: new Date().toISOString()
            });
        } catch (error: any) {
            console.error("[MIGRATION] ❌ Migration failed:", error);
            res.status(500).json({
                success: false,
                error: error.message,
                hint: "Check if columns already exist or database connection is valid"
            });
        }
    }
};
