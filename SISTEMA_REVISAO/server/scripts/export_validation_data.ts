
import { db } from "../core/db/connection";
import { rides, shifts, fraudEvents, drivers } from "../../shared/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eq } from "drizzle-orm";

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "../../dump_validation");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. DEFINIÇÃO DE PERÍODO (OBRIGATÓRIA)
const DATA_INICIAL = new Date("2025-10-01T00:00:00Z");
const DATA_FINAL = new Date("2025-12-31T23:59:59Z");

console.log(`PERÍODO CONSIDERADO CONFIÁVEL PARA VALIDAÇÃO:`);
console.log(`DATA_INICIAL = ${DATA_INICIAL.toISOString()}`);
console.log(`DATA_FINAL   = ${DATA_FINAL.toISOString()}`);

async function exportData() {
    console.log("Iniciando extração bruta...");

    // Fetch ALL data first (No DB filtering to ensure logic is applied in code as requested/controlled)
    const allShifts = await db.query.shifts.findMany();
    const allRides = await db.query.rides.findMany();
    const allEvents = await db.query.fraudEvents.findMany();
    const allDrivers = await db.query.drivers.findMany();

    // 2.2 TURNOS - Lógica de Interseção
    const includedShifts: typeof allShifts = [];
    const includedShiftIds = new Set<string>();

    for (const s of allShifts) {
        const start = new Date(s.inicio);
        const end = s.fim ? new Date(s.fim) : new Date("2099-12-31"); // Open shift treated as future end

        // Intersection Logic: !(End < StartPeriod || Start > EndPeriod)
        // Also ensure we handle the case where End is null/open correctly if needed, but here we assume 'end' or 'now'.
        // User rule: "Turno deve ser incluído se tiver QUALQUER interseção"

        // Simplified Intersection Check:
        // Shift [S, E], Period [PS, PE]
        // Overlap if S <= PE AND E >= PS

        if (start <= DATA_FINAL && end >= DATA_INICIAL) {
            includedShifts.push(s);
            includedShiftIds.add(s.id);
        }
    }

    const shiftsOutput = includedShifts.map(s => {
        const start = new Date(s.inicio);
        const end = s.fim ? new Date(s.fim) : null;
        // Do not recalculate duration/totals if strict "no fix" is required, BUT user prompt said:
        // "Não recalcular duração" for 'logic', but requested schema has 'duracaoMin'.
        // If schema has it, use it. If schema has 0/null, use it.
        // Wait, schema has s.duracaoMin. I should use that if available, else 0.
        // User requested: "duracaoMin": "number".
        // Use DB value strictly.
        return {
            shift_id: s.id,
            driver_id: s.driverId,
            vehicle_id: s.vehicleId,
            inicio: s.inicio.toISOString(), // ISO with timezone (UTC usually from Postgres)
            fim: s.fim ? s.fim.toISOString() : null,
            km_inicial: Number(s.kmInicial),
            km_final: Number(s.kmFinal),
            total_corridas: s.totalCorridas,
            total_bruto: Number(s.totalBruto),
            duracaoMin: s.duracaoMin || 0, // strict from DB
            status: s.status
        };
    });
    fs.writeFileSync(path.join(OUTPUT_DIR, "shifts.json"), JSON.stringify(shiftsOutput, null, 2));

    // 2.1 CORRIDAS
    // Provide map for missing fields if manual join needed, but strictly filter by shift
    const shiftMap = new Map<string, { driverId: string, vehicleId: string }>();
    allShifts.forEach(s => shiftMap.set(s.id, { driverId: s.driverId, vehicleId: s.vehicleId }));

    const ridesOutput: any[] = [];
    for (const r of allRides) {
        if (includedShiftIds.has(r.shiftId)) {
            const sInfo = shiftMap.get(r.shiftId);
            ridesOutput.push({
                ride_id: r.id,
                shift_id: r.shiftId,
                driver_id: sInfo?.driverId || "UNKNOWN",
                vehicle_id: sInfo?.vehicleId || "UNKNOWN",
                timestamp: r.hora.toISOString(),
                valor: Number(r.valor)
            });
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, "rides.json"), JSON.stringify(ridesOutput, null, 2));

    // 2.3 EVENTOS
    // "Retornar TODOS os eventos do período".
    // Interpret: Events linked to included shifts OR detected within period?
    // User Context: "Validar se antifraude está coerente...". Usually linked to shift.
    // Spec: "event_id", "shift_id", "detectedAt".
    // Strategy: Include if linked to included Shift OR if detectedAt is in period (for unlinked/orphaned).
    const eventsOutput: any[] = [];
    for (const e of allEvents) {
        const dAt = new Date(e.detectedAt as Date);
        const inPeriod = dAt >= DATA_INICIAL && dAt <= DATA_FINAL;
        const linkedToIncludedShift = e.shiftId && includedShiftIds.has(e.shiftId);

        if (inPeriod || linkedToIncludedShift) {
            eventsOutput.push({
                event_id: e.id,
                shift_id: e.shiftId || "N/A",
                riskScore: e.riskScore,
                riskLevel: e.riskLevel,
                status: e.status,
                rules: e.rules,
                metadata: e.metadata,
                detectedAt: e.detectedAt ? new Date(e.detectedAt).toISOString() : null
            });
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, "fraud_events.json"), JSON.stringify(eventsOutput, null, 2));

    // 2.4 MOTORISTAS
    const driversOutput = allDrivers.map(d => ({
        driver_id: d.id,
        status: d.isActive ? "ativo" : "inativo",
        data_inicio: null
    }));
    fs.writeFileSync(path.join(OUTPUT_DIR, "drivers.json"), JSON.stringify(driversOutput, null, 2));

    // 2.5 DIAS PROBLEMÁTICOS
    // "Retornar explicitamente os dias já conhecidos".
    // I know 2025-12-27 caused a "data anomaly" where all data appeared as today's data.
    // I will list it.
    const problematicDays = [
        { date: "2025-12-27", issue: "Execução acidental de analyzeAllShifts gerando eventos retroativos" }
    ];
    fs.writeFileSync(path.join(OUTPUT_DIR, "problematic_days.json"), JSON.stringify(problematicDays, null, 2));

    console.log("Entrega concluída.");
    console.log(`Arquivos entregues:`);
    console.log(`- rides.json: ${ridesOutput.length} registros`);
    console.log(`- shifts.json: ${shiftsOutput.length} registros`);
    console.log(`- fraud_events.json: ${eventsOutput.length} registros`);
    console.log(`- drivers.json: ${driversOutput.length} registros`);
    console.log(`- problematic_days.json: ${problematicDays.length} registros`);

    process.exit(0);
}

exportData().catch(e => {
    console.error("Erro fatal:", e);
    process.exit(1);
});
