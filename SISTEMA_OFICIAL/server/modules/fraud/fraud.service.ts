import { db } from "../../core/db/connection.js";
import { shifts, rides } from "../../../shared/schema.js";
import { eq, lt, desc, sql } from "drizzle-orm";
import { calculateAuditMetrics } from "./fraud.audit.service.js";
import { buildDriverBaseline } from "./fraud.baseline.js";
import { analyzeShiftRules, checkProductivityVsBaseline, checkDriverHistoricalDeviation, checkValueAsymmetry, checkTimeGapsWithPresence } from "./fraud.engine.js";
import { FraudRepository } from "./fraud.repository.js";
import { FraudShiftAnalysis, ShiftContext, FraudRuleHit } from "./fraud.types.js";

export const FraudService = {
    /**
     * Analisa um turno específico em busca de fraudes.
     * Orquestra a coleta de dados, cálculo de baseline e execução do engine.
     */
    async analyzeShift(shiftId: string): Promise<FraudShiftAnalysis | null> {
        // 1. Buscar dados do turno
        const shift = await db.query.shifts.findFirst({
            where: (s, { eq }) => eq(s.id, shiftId),
        });

        if (!shift) return null;

        // Buscar corridas (para calcular totais se necessário ou validar)
        const shiftRides = await db.query.rides.findMany({
            where: (r, { eq }) => eq(r.shiftId, shiftId),
        });

        // 2. Preparar Dados
        const inicio = new Date(shift.inicio);
        const fim = shift.fim ? new Date(shift.fim) : new Date();

        // Garantir duração mínima para evitar divisão por zero
        const durationHours = Math.max(
            0.01,
            (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
        );

        const kmStart = Number(shift.kmInicial || 0);
        const kmEnd = Number(shift.kmFinal || 0);

        // Tratamento de segurança para dados numéricos
        let totalBruto = Number(shift.totalBruto || 0);
        let totalCorridas = Number(shift.totalCorridas || 0);

        // Fallback se totais estiverem zerados (mas há corridas)
        if ((totalBruto <= 0 || totalCorridas <= 0) && shiftRides.length > 0) {
            totalBruto = shiftRides.reduce((acc, ride) => acc + Number(ride.valor), 0);
            totalCorridas = shiftRides.length;
        }

        // 3. Carregar Contexto (Shift Anterior + Baseline)
        const prevShift = await db.query.shifts.findFirst({
            where: (s, { and, eq, lt }) =>
                and(eq(s.vehicleId, shift.vehicleId), lt(s.inicio, shift.inicio)),
            orderBy: (s, { desc }) => desc(s.inicio),
        });

        const baseline = await buildDriverBaseline(shift.driverId, inicio.toISOString());

        const ctx: ShiftContext = {
            baseline,
            prevShiftKmEnd: prevShift ? Number(prevShift.kmFinal || 0) : null,
        };

        // 4. Executar Engine de Regras (inclui valores das corridas para detecção de padrões)
        const rideValues = shiftRides.map(r => Number(r.valor));
        const score = analyzeShiftRules(
            kmStart,
            kmEnd,
            totalBruto,
            totalCorridas,
            durationHours,
            ctx,
            rideValues // NEW: Pass ride values for sequence detection
        );

        // --- v2.0 INTELLIGENCE RULES (Async) ---
        const asyncHits: FraudRuleHit[] = [];

        // 1. Productivity vs Fleet Baseline
        const prodHit = await checkProductivityVsBaseline(inicio, durationHours, shift.driverId, shiftRides);
        if (prodHit) asyncHits.push(prodHit);

        // 2. Driver vs Historical Self
        const historyHit = await checkDriverHistoricalDeviation(shift.id, shift.driverId, durationHours, totalCorridas);
        if (historyHit) asyncHits.push(historyHit);

        // 3. Value Asymmetry (Cherry Picking)
        const asymmetryHit = await checkValueAsymmetry(shift.id, shift.driverId, inicio, fim, shiftRides);
        if (asymmetryHit) asyncHits.push(asymmetryHit);

        // 4. Time Gaps with Presence
        const gapHit = await checkTimeGapsWithPresence(shift, shiftRides);
        if (gapHit) asyncHits.push(gapHit);

        // Merge Scores
        if (asyncHits.length > 0) {
            score.reasons.push(...asyncHits);
            score.totalScore += asyncHits.reduce((acc, h) => acc + h.score, 0);

            // Re-evaluate level (Safe/Simple logic matching engine thresholds)
            if (score.totalScore >= 70) score.level = 'critical';
            else if (score.totalScore >= 35) score.level = 'high';
            else if (score.totalScore >= 20) score.level = 'medium';
            else score.level = 'low';
        }

        // 5. Montar Objeto de Análise
        const kmTotal = Math.max(0, kmEnd - kmStart);

        const analysis: FraudShiftAnalysis = {
            shiftId: shift.id,
            driverId: shift.driverId,
            vehicleId: shift.vehicleId,
            date: inicio.toISOString().split("T")[0],
            shiftInicio: inicio, // Full timestamp for accurate detectedAt
            kmTotal,
            revenueTotal: totalBruto,
            revenuePerKm: kmTotal > 0 ? totalBruto / kmTotal : 0,
            revenuePerHour: totalBruto / durationHours,
            ridesPerHour: totalCorridas / durationHours,
            score,
            baseline: baseline || undefined, // Persist for PDF
            isPartialAnalysis: shift.status === 'em_andamento', // 🔴 NOVO: Marca se análise é parcial
        };

        // 6. Persistir Resultado
        await FraudRepository.saveFraudEvent(analysis);

        return analysis;
    },

    /**
     * Analisa todos os turnos concluídos no banco de dados.
     * Útil para população inicial ou reprocessamento.
     */
    async analyzeAllShifts() {
        console.log("🚀 Iniciando análise de fraude em massa...");
        try {
            const completedShifts = await db.query.shifts.findMany({
                where: (s, { eq }) => eq(s.status, 'finalizado')
            });

            console.log(`📊 Encontrados ${completedShifts.length} turnos concluídos para análise.`);
            let count = 0;

            for (const shift of completedShifts) {
                try {
                    await new Promise(r => setTimeout(r, 50)); // Delay para não sobrecarregar
                    await this.analyzeShift(shift.id);
                    count++;
                    if (count % 10 === 0) console.log(`Processed ${count}/${completedShifts.length} shifts...`);
                } catch (err) {
                    console.error(`❌ Erro ao analisar turno ${shift.id}:`, err);
                }
            }
            console.log(`✅ Análise em massa concluída! ${count} turnos processados.`);
        } catch (error) {
            console.error("❌ Erro fatal na análise em massa:", error);
        }
    },

    /**
     * Analisa turnos abertos do dia atual (tempo real).
     * Permite detectar fraudes enquanto o turno ainda está em andamento.
     */
    async analyzeTodayOpenShifts() {
        console.log("🔍 Analisando turnos ABERTOS de hoje...");
        try {
            const openShifts = await db.query.shifts.findMany({
                where: (s, { eq }) => eq(s.status, 'em_andamento')
            });

            console.log(`📊 Encontrados ${openShifts.length} turnos abertos para análise em tempo real.`);
            let count = 0;
            const results = [];

            for (const shift of openShifts) {
                try {
                    const analysis = await this.analyzeShift(shift.id);
                    if (analysis) {
                        results.push(analysis);
                        count++;
                    }
                } catch (err) {
                    console.error(`❌ Erro ao analisar turno aberto ${shift.id}:`, err);
                }
            }
            console.log(`✅ Análise em tempo real concluída! ${count} turnos abertos processados.`);
            return results;
        } catch (error) {
            console.error("❌ Erro na análise de turnos abertos:", error);
            return [];
        }
    },

    /**
     * Gera uma previsão de análise de fraude baseada nos dados atuais do turno.
     * Útil para exibir ao usuário o que seria detectado se o turno fosse encerrado agora ou reanalisado.
     */
    async generatePreview(shiftId: string) {
        // 1. Buscar dados do turno
        const shift = await db.query.shifts.findFirst({
            where: (s, { eq }) => eq(s.id, shiftId),
            with: {
                driver: true,
                vehicle: true
            }
        });

        if (!shift) throw new Error("Turno não encontrado");

        // Buscar corridas
        const shiftRides = await db.query.rides.findMany({
            where: (r, { eq }) => eq(r.shiftId, shiftId),
        });

        // 2. Preparar Dados
        const inicio = new Date(shift.inicio);
        const fim = shift.fim ? new Date(shift.fim) : new Date();

        // Garantir duração mínima
        const durationHours = Math.max(
            0.01,
            (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60)
        );

        const kmStart = Number(shift.kmInicial || 0);
        const kmEnd = Number(shift.kmFinal || 0);

        // Tratamento de segurança para dados numéricos
        let totalBruto = Number(shift.totalBruto || 0);
        let totalCorridas = Number(shift.totalCorridas || 0);

        // Fallback se totais estiverem zerados (mas há corridas)
        if ((totalBruto <= 0 || totalCorridas <= 0) && shiftRides.length > 0) {
            totalBruto = shiftRides.reduce((acc, ride) => acc + Number(ride.valor), 0);
            totalCorridas = shiftRides.length;
        }

        // 3. Carregar Contexto - OTIMIZADO: Busca apenas o último turno do MESMO motorista
        const ctx: ShiftContext = {
            baseline: null,
            prevShiftKmEnd: null,
        };

        // Baseline (pode demorar, então idealmente seria cached, mas aqui é preview)
        const baseline = await buildDriverBaseline(shift.driverId, inicio.toISOString());
        ctx.baseline = baseline;

        // 4. Executar Engine de Regras
        const rideValues = shiftRides.map(r => Number(r.valor));
        const score = analyzeShiftRules(
            kmStart,
            kmEnd,
            totalBruto,
            totalCorridas,
            durationHours,
            ctx,
            rideValues
        );

        // --- v2.0 INTELLIGENCE RULES (Preview) ---
        const asyncHits: FraudRuleHit[] = [];

        // 1. Productivity vs Fleet Baseline
        const prodHit = await checkProductivityVsBaseline(inicio, durationHours, shift.driverId, shiftRides);
        if (prodHit) asyncHits.push(prodHit);

        // 2. Driver vs Historical Self
        const historyHit = await checkDriverHistoricalDeviation(shift.id, shift.driverId, durationHours, totalCorridas);
        if (historyHit) asyncHits.push(historyHit);

        // 3. Value Asymmetry
        const asymmetryHit = await checkValueAsymmetry(shift.id, shift.driverId, inicio, fim, shiftRides);
        if (asymmetryHit) asyncHits.push(asymmetryHit);

        // 4. Time Gaps
        const gapHit = await checkTimeGapsWithPresence(shift, shiftRides);
        if (gapHit) asyncHits.push(gapHit);

        // Merge Scores
        if (asyncHits.length > 0) {
            score.reasons.push(...asyncHits);
            score.totalScore += asyncHits.reduce((acc, h) => acc + h.score, 0);

            // Re-evaluate level
            if (score.totalScore >= 70) score.level = 'critical';
            else if (score.totalScore >= 35) score.level = 'high';
            else if (score.totalScore >= 20) score.level = 'medium';
            else score.level = 'low';
        }

        // 5. Montar Objeto de Análise (Sem salvar)
        const kmTotal = Math.max(0, kmEnd - kmStart);

        return {
            shiftId: shift.id,
            driverId: shift.driverId,
            driverName: shift.driver?.nome || "Desconhecido",
            vehicleId: shift.vehicleId,
            vehiclePlate: shift.vehicle?.plate || "N/A",
            date: inicio.toISOString().split("T")[0],
            kmTotal,
            revenueTotal: totalBruto,
            revenuePerKm: kmTotal > 0 ? totalBruto / kmTotal : 0,
            revenuePerHour: totalBruto / durationHours,
            ridesPerHour: totalCorridas / durationHours,
            score,
            baseline
        };
    },

    /**
     * Recupera os detalhes completos de um evento de fraude, incluindo dados do turno,
     * métricas calculadas e auditoria.
     */
    async getEventDetail(eventId: string) {
        const event = await FraudRepository.getFraudEventById(eventId);

        if (!event) {
            return null; // Controller treated as 404
        }

        if (!event.shiftId) {
            throw new Error("Evento sem turno associado");
        }

        let shiftData = await db.query.shifts.findFirst({
            where: (s, { eq }) => eq(s.id, event.shiftId as string)
        });

        // FALLBACK GRACEFUL PARA EVENTOS ÓRFÃOS
        if (!shiftData) {
            console.warn(`[FRAUD] Evento ${eventId} possui turno órfão ${event.shiftId}. Usando fallback de metadata.`);
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
            const rawType = (r.tipo || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const val = Number(r.valor || 0);

            if (['app', 'aplicativo'].includes(rawType)) {
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

        return {
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
        };
    },

    /**
     * Coleta os dados necessários para gerar o PDF detalhado de um evento de fraude.
     */
    async getEventPdfData(eventId: string) {
        // 1. Buscar evento de fraude
        const event = await FraudRepository.getFraudEventById(eventId);
        if (!event) throw new Error("Evento não encontrado");
        if (!event.shiftId) throw new Error("Evento sem turno associado");

        // 2. Buscar turno completo
        const shift = await db.query.shifts.findFirst({
            where: (s, { eq }) => eq(s.id, event.shiftId!),
            with: {
                driver: true,
                vehicle: true
            }
        });

        if (!shift) throw new Error("Turno original não encontrado");

        // 3. Buscar corridas
        const ridesList = await db.query.rides.findMany({
            where: (r, { eq }) => eq(r.shiftId, shift.id)
        });

        // 4. Buscar histórico recente de eventos para esse motorista (Contexto)
        const recentEvents = await FraudRepository.getFraudEvents({
            driverId: shift.driverId,
            limit: 5 // Últimos 5 eventos
        });

        return {
            event,
            shift,
            rides: ridesList,
            driver: shift.driver,
            vehicle: shift.vehicle,
            recentHistory: recentEvents
        };
    }
};
