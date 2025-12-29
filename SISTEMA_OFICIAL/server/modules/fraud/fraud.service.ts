import { db } from "../../core/db/connection.js";
import { shifts, rides } from "../../../shared/schema.js";
import { eq, lt, desc } from "drizzle-orm";
import { buildDriverBaseline } from "./fraud.baseline.js";
import { analyzeShiftRules } from "./fraud.engine.js";
import { FraudRepository } from "./fraud.repository.js";
import { FraudShiftAnalysis, ShiftContext } from "./fraud.types.js";

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
    }
};
