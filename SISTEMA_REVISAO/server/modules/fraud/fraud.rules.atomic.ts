/**
 * REGRAS ATÔMICAS DE FRAUDE - V3
 *
 * Cada regra verifica UMA coisa específica e retorna dados detalhados
 * para auditoria ("dedo duro").
 */

import { db } from "../../core/db/connection.js";
import { shifts, rides, drivers, vehicles } from "../../../shared/schema.js";
import { eq, and, gte, lte, ne, isNotNull, desc } from "drizzle-orm";

// --- TIPOS ---

export interface FleetComparison {
    driverName: string;
    vehiclePlate: string;
    rides: {
        hora: string;  // HH:mm
        valor: number;
        tipo: string;  // App | Particular
    }[];
    total: number;
}

export interface AtomicRuleHit {
    code: string;
    name: string;           // Nome legível da regra
    category: string;       // Categoria da regra
    severity: 'low' | 'medium' | 'high' | 'critical';
    score: number;

    // DADOS "DEDO DURO"
    what: string;           // O QUE aconteceu
    when: {                 // QUANDO
        start: string;      // ISO date ou HH:mm
        end?: string;
    };
    values: {               // VALORES ESPECÍFICOS
        observed: string;   // Valor observado
        expected: string;   // Valor esperado/limite
        diff?: string;      // Diferença
    };
    evidence?: {            // EVIDÊNCIAS DETALHADAS
        rides?: { hora: string; valor: number; tipo: string }[];  // Corridas suspeitas
        intervals?: { start: string; end: string; duration: string }[];  // Gaps
    };
    comparison?: {          // COMPARAÇÃO COM FROTA
        context: string;    // Ex: "Durante 21:00-21:30"
        fleet: FleetComparison[];
        yourValue: string;
    };
}

// --- HELPERS ---

const fmtTime = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR');
const fmtMoney = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

// --- FUNÇÕES DE BUSCA ---

export async function getFleetRidesInPeriod(
    startTime: Date,
    endTime: Date,
    excludeShiftId: string
): Promise<FleetComparison[]> {
    // Buscar turnos ativos no período
    const activeShifts = await db.query.shifts.findMany({
        where: and(
            lte(shifts.inicio, endTime),
            gte(shifts.fim, startTime),
            ne(shifts.id, excludeShiftId)
        ),
        with: {
            driver: true,
            vehicle: true,
            rides: true
        }
    });

    const comparisons: FleetComparison[] = [];

    for (const shift of activeShifts) {
        const ridesInPeriod = (shift.rides as any[]).filter((r: any) => {
            const rideTime = new Date(r.hora);
            return rideTime >= startTime && rideTime <= endTime;
        });

        if (ridesInPeriod.length > 0) {
            comparisons.push({
                driverName: (shift.driver as any)?.nome || 'Motorista',
                vehiclePlate: (shift.vehicle as any)?.placa || 'Veículo',
                rides: ridesInPeriod.map((r: any) => ({
                    hora: fmtTime(new Date(r.hora)),
                    valor: Number(r.valor),
                    tipo: r.tipo?.toLowerCase() === 'app' ? 'App' : 'Particular'
                })),
                total: ridesInPeriod.length
            });
        }
    }

    return comparisons;
}

// --- REGRAS ATÔMICAS ---

/**
 * REGRA 18: GAP_ACIMA_30MIN
 * Detecta intervalos > 30 min sem corrida e compara com outros motoristas
 */
export async function ruleGapAbove30Min(
    shift: any,
    driverRides: any[]
): Promise<AtomicRuleHit[]> {
    const hits: AtomicRuleHit[] = [];

    const sortedRides = [...driverRides].sort((a, b) =>
        new Date(a.hora).getTime() - new Date(b.hora).getTime()
    );

    let lastTime = new Date(shift.inicio);

    for (const ride of sortedRides) {
        const rideTime = new Date(ride.hora);
        const gapMs = rideTime.getTime() - lastTime.getTime();
        const gapMin = gapMs / 60000;

        if (gapMin >= 30) {
            // Buscar o que outros motoristas fizeram nesse período
            const fleetComparison = await getFleetRidesInPeriod(
                lastTime,
                rideTime,
                shift.id
            );

            const fleetTotal = fleetComparison.reduce((sum, f) => sum + f.total, 0);

            hits.push({
                code: 'GAP_ACIMA_30MIN',
                name: 'REGRA 18 — GAP ACIMA DE 30 MINUTOS',
                category: 'Gaps de Tempo',
                severity: gapMin >= 60 ? 'high' : 'medium',
                score: gapMin >= 60 ? 15 : 10,

                what: `Intervalo de ${Math.round(gapMin)} minutos sem corridas`,
                when: {
                    start: fmtTime(lastTime),
                    end: fmtTime(rideTime)
                },
                values: {
                    observed: `${Math.round(gapMin)} min sem atividade`,
                    expected: 'Máximo de 30 min entre corridas',
                    diff: `${Math.round(gapMin - 30)} min acima do limite`
                },
                evidence: {
                    intervals: [{
                        start: fmtTime(lastTime),
                        end: fmtTime(rideTime),
                        duration: `${Math.round(gapMin)} min`
                    }]
                },
                comparison: fleetTotal > 0 ? {
                    context: `Durante ${fmtTime(lastTime)} - ${fmtTime(rideTime)}`,
                    fleet: fleetComparison,
                    yourValue: '0 corridas'
                } : undefined
            });
        }

        lastTime = rideTime;
    }

    // Verificar gap final até fim do turno
    if (shift.fim) {
        const endTime = new Date(shift.fim);
        const finalGapMs = endTime.getTime() - lastTime.getTime();
        const finalGapMin = finalGapMs / 60000;

        if (finalGapMin >= 30) {
            const fleetComparison = await getFleetRidesInPeriod(lastTime, endTime, shift.id);
            const fleetTotal = fleetComparison.reduce((sum, f) => sum + f.total, 0);

            hits.push({
                code: 'GAP_ACIMA_30MIN',
                name: 'REGRA 18 — GAP ACIMA DE 30 MINUTOS (FINAL)',
                category: 'Gaps de Tempo',
                severity: finalGapMin >= 60 ? 'high' : 'medium',
                score: finalGapMin >= 60 ? 15 : 10,

                what: `Intervalo final de ${Math.round(finalGapMin)} minutos antes de encerrar`,
                when: {
                    start: fmtTime(lastTime),
                    end: fmtTime(endTime)
                },
                values: {
                    observed: `${Math.round(finalGapMin)} min sem atividade`,
                    expected: 'Máximo de 30 min entre corridas',
                    diff: `${Math.round(finalGapMin - 30)} min acima`
                },
                comparison: fleetTotal > 0 ? {
                    context: `Durante ${fmtTime(lastTime)} - ${fmtTime(endTime)}`,
                    fleet: fleetComparison,
                    yourValue: '0 corridas'
                } : undefined
            });
        }
    }

    return hits;
}

/**
 * REGRA 14: CORRIDAS_CONSECUTIVAS_MESMO_VALOR
 * Detecta 4+ corridas seguidas com exatamente o mesmo valor
 */
export function ruleConsecutiveSameValue(
    driverRides: any[]
): AtomicRuleHit[] {
    const hits: AtomicRuleHit[] = [];

    if (driverRides.length < 4) return hits;

    const sortedRides = [...driverRides].sort((a, b) =>
        new Date(a.hora).getTime() - new Date(b.hora).getTime()
    );

    let streak = 1;
    let streakValue = Number(sortedRides[0].valor);
    let streakStart = 0;

    for (let i = 1; i < sortedRides.length; i++) {
        const val = Number(sortedRides[i].valor);

        if (Math.abs(val - streakValue) < 0.01) {
            streak++;
        } else {
            // Verificar se streak anterior era suspeito
            if (streak >= 4) {
                const suspectRides = sortedRides.slice(streakStart, i);

                hits.push({
                    code: 'CORRIDAS_CONSECUTIVAS_MESMO_VALOR',
                    name: 'REGRA 14 — CORRIDAS CONSECUTIVAS COM MESMO VALOR',
                    category: 'Padrões de Corridas',
                    severity: streak >= 6 ? 'critical' : 'high',
                    score: streak >= 6 ? 30 : 20,

                    what: `${streak} corridas consecutivas de ${fmtMoney(streakValue)}`,
                    when: {
                        start: fmtTime(new Date(suspectRides[0].hora)),
                        end: fmtTime(new Date(suspectRides[suspectRides.length - 1].hora))
                    },
                    values: {
                        observed: `${streak} corridas com valor ${fmtMoney(streakValue)}`,
                        expected: 'Variação natural de valores',
                        diff: `${streak - 3} corridas acima do tolerado`
                    },
                    evidence: {
                        rides: suspectRides.map((r: any) => ({
                            hora: fmtTime(new Date(r.hora)),
                            valor: Number(r.valor),
                            tipo: r.tipo?.toLowerCase() === 'app' ? 'App' : 'Particular'
                        }))
                    }
                });
            }

            streak = 1;
            streakValue = val;
            streakStart = i;
        }
    }

    // Verificar streak final
    if (streak >= 4) {
        const suspectRides = sortedRides.slice(streakStart);

        hits.push({
            code: 'CORRIDAS_CONSECUTIVAS_MESMO_VALOR',
            name: 'REGRA 14 — CORRIDAS CONSECUTIVAS COM MESMO VALOR',
            category: 'Padrões de Corridas',
            severity: streak >= 6 ? 'critical' : 'high',
            score: streak >= 6 ? 30 : 20,

            what: `${streak} corridas consecutivas de ${fmtMoney(streakValue)}`,
            when: {
                start: fmtTime(new Date(suspectRides[0].hora)),
                end: fmtTime(new Date(suspectRides[suspectRides.length - 1].hora))
            },
            values: {
                observed: `${streak} corridas com valor ${fmtMoney(streakValue)}`,
                expected: 'Variação natural de valores',
                diff: `${streak - 3} corridas acima do tolerado`
            },
            evidence: {
                rides: suspectRides.map((r: any) => ({
                    hora: fmtTime(new Date(r.hora)),
                    valor: Number(r.valor),
                    tipo: r.tipo?.toLowerCase() === 'app' ? 'App' : 'Particular'
                }))
            }
        });
    }

    return hits;
}

/**
 * REGRA 02: TURNO_RECEITA_KM_ABAIXO_MINIMO
 */
export function ruleLowRevenuePerKm(
    shift: any,
    kmTotal: number,
    revenueTotal: number
): AtomicRuleHit | null {
    if (kmTotal <= 0) return null;

    const revPerKm = revenueTotal / kmTotal;
    const threshold = 2.00;

    if (revPerKm >= threshold) return null;

    return {
        code: 'TURNO_RECEITA_KM_ABAIXO_MINIMO',
        name: 'REGRA 02 — RECEITA POR KM ABAIXO DO MÍNIMO',
        category: 'Regras de Turno',
        severity: revPerKm < 1.50 ? 'critical' : 'high',
        score: revPerKm < 1.50 ? 30 : 20,

        what: `Receita por quilômetro de ${fmtMoney(revPerKm)}/km`,
        when: {
            start: fmtDate(new Date(shift.inicio))
        },
        values: {
            observed: `${fmtMoney(revPerKm)}/km`,
            expected: `Mínimo ${fmtMoney(threshold)}/km`,
            diff: `${fmtMoney(threshold - revPerKm)}/km abaixo`
        }
    };
}

/**
 * REGRA 22: FROTA_PRODUTIVIDADE_ABAIXO
 * Compara com todos os motoristas do mesmo dia
 */
export async function ruleFleetProductivityBelow(
    shift: any,
    driverRides: any[],
    durationHours: number
): Promise<AtomicRuleHit | null> {
    if (durationHours < 1) return null; // Turno muito curto

    const myRidesPerHour = driverRides.length / durationHours;

    // Ignorar se produtividade absoluta é boa
    if (myRidesPerHour >= 1.5) return null;

    // Buscar outros turnos do mesmo dia
    const shiftDate = new Date(shift.inicio);
    const dayStart = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const otherShifts = await db.query.shifts.findMany({
        where: and(
            gte(shifts.inicio, dayStart),
            lte(shifts.inicio, dayEnd),
            ne(shifts.id, shift.id),
            isNotNull(shifts.fim)
        ),
        with: {
            driver: true,
            vehicle: true,
            rides: true
        }
    });

    if (otherShifts.length < 1) return null;

    // Calcular produtividade de cada um
    const fleetStats = otherShifts.map((s: any) => {
        const dur = (new Date(s.fim).getTime() - new Date(s.inicio).getTime()) / 3600000;
        const ridesCount = (s.rides as any[]).length;
        return {
            driverName: s.driver?.nome || 'Motorista',
            vehiclePlate: s.vehicle?.placa || 'Veículo',
            rides: ridesCount,
            revenue: (s.rides as any[]).reduce((sum: number, r: any) => sum + Number(r.valor), 0),
            ridesPerHour: dur > 0 ? ridesCount / dur : 0
        };
    }).filter(s => s.ridesPerHour > 0);

    if (fleetStats.length < 1) return null;

    const avgFleetRph = fleetStats.reduce((sum, s) => sum + s.ridesPerHour, 0) / fleetStats.length;

    if (myRidesPerHour >= avgFleetRph * 0.5) return null; // Não é 50% abaixo

    return {
        code: 'FROTA_PRODUTIVIDADE_ABAIXO',
        name: 'REGRA 22 — PRODUTIVIDADE ABAIXO DE 50% DA FROTA',
        category: 'Comparação Frota',
        severity: 'high',
        score: 15,

        what: `Produtividade ${Math.round((1 - myRidesPerHour / avgFleetRph) * 100)}% abaixo da frota`,
        when: {
            start: fmtDate(new Date(shift.inicio))
        },
        values: {
            observed: `${myRidesPerHour.toFixed(1)} corridas/hora`,
            expected: `Mínimo ${(avgFleetRph * 0.5).toFixed(1)} corridas/hora (50% da frota)`,
            diff: `${(avgFleetRph - myRidesPerHour).toFixed(1)} corr/h abaixo`
        },
        comparison: {
            context: `Comparação com ${fleetStats.length} motoristas do dia ${fmtDate(shiftDate)}`,
            fleet: fleetStats.sort((a, b) => b.ridesPerHour - a.ridesPerHour).map(s => ({
                driverName: s.driverName,
                vehiclePlate: s.vehiclePlate,
                rides: [],
                total: s.rides
            })),
            yourValue: `${myRidesPerHour.toFixed(1)} corr/h`
        }
    };
}
