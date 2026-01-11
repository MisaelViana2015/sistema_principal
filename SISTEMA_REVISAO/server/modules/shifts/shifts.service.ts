import * as shiftsRepository from "./shifts.repository.js";
import { FraudService } from "../fraud/fraud.service.js";
import { FinancialCalculator } from "../financial/FinancialCalculator.js";
import { db } from "../../core/db/connection.js";
import { shifts, vehicles, rides, expenses } from "../../../shared/schema.js";
import { eq, sql } from "drizzle-orm";
import { auditService, AUDIT_ACTIONS } from "../../core/audit/index.js";
import type { AuditContext } from "../../core/audit/index.js";

export async function getAllShifts(page: number, limit: number, filters: any) {
    return await shiftsRepository.findAllShifts(page, limit, filters);
}

export async function startShift(driverId: string, vehicleId: string, kmInicial: number, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-start-shift');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.START_SHIFT,
        entity: 'shifts',
        entityId: 'new', // ID será gerado dentro
        operation: 'INSERT',
        context: auditContext,
        execute: async () => {
            return await db.transaction(async (tx) => {
                // Check if driver already has open shift
                const openShift = await shiftsRepository.findOpenShiftByDriver(driverId);

                // RE-CHECK Driver status inside TX
                const currentOpenShift = await tx.query.shifts.findFirst({
                    where: (s, { and, eq }) => and(eq(s.driverId, driverId), eq(s.status, 'em_andamento'))
                });
                if (currentOpenShift) throw new Error("Motorista já possui um turno aberto.");

                // Validação de KM Progressivo
                const vehicle = await tx.query.vehicles.findFirst({
                    where: eq(vehicles.id, vehicleId)
                });

                if (vehicle && kmInicial < vehicle.kmInicial) {
                    throw new Error(`KM inválido! O veículo está com ${vehicle.kmInicial} Km. Você informou ${kmInicial} Km.`);
                }

                // REGRA: Veículo não pode estar em uso por outro motorista (Check Inside TX)
                const vehicleInUse = await tx.query.shifts.findFirst({
                    where: (s, { and, eq }) => and(eq(s.vehicleId, vehicleId), eq(s.status, 'em_andamento'))
                });

                if (vehicleInUse) {
                    throw new Error(`Este veículo já está em uso em outro turno.`);
                }

                const newShift = await shiftsRepository.createShift({
                    driverId,
                    vehicleId,
                    kmInicial,
                    inicio: new Date(),
                    status: 'em_andamento'
                });

                return newShift;
            });
        },
        fetchAfter: async (result) => {
            if (result && result.id) {
                return await getShiftById(result.id);
            }
            return result;
        }
    });
}

export async function finishShift(shiftId: string, kmFinal: number, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-finish-shift');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.FINISH_SHIFT,
        entity: 'shifts',
        entityId: shiftId,
        operation: 'UPDATE',
        context: auditContext,
        fetchBefore: () => getShiftById(shiftId),
        execute: async () => {
            const shift = await shiftsRepository.findShiftById(shiftId);
            if (!shift) throw new Error("Turno não encontrado");
            if (shift.status !== 'em_andamento' && shift.status !== 'aberto') throw new Error("Turno já finalizado");

            // Validação de KM Final >= KM Inicial do Turno
            if (kmFinal < shift.kmInicial) {
                throw new Error(`KM Final (${kmFinal}) não pode ser menor que o KM Inicial do turno (${shift.kmInicial}).`);
            }

            // TRANSAÇÃO ATÔMICA COMPLETA: Tudo ou Nada
            const updatedShift = await db.transaction(async (tx) => {
                // 1. Buscar Corridas e Despesas para Cálculo Financeiro
                const ridesData = await tx.select().from(rides).where(eq(rides.shiftId, shiftId));
                const expensesData = await tx.select().from(expenses).where(eq(expenses.shiftId, shiftId));

                // 2. Calcular Totais de Receita
                const totalApp = ridesData
                    .filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                    .reduce((sum, r) => sum + Number(r.valor || 0), 0);

                const totalParticular = ridesData
                    .filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
                    .reduce((sum, r) => sum + Number(r.valor || 0), 0);

                const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;
                const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;
                const totalCorridas = ridesData.length;

                // 3. Calcular Totais de Custos
                const normalExpenses = expensesData.filter(e => !e.isSplitCost);
                const splitExpenses = expensesData.filter(e => e.isSplitCost);
                const totalCustosParticular = expensesData.filter(e => e.isParticular).reduce((sum, e) => sum + Number(e.value || 0), 0);
                const totalCustosNormais = normalExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
                const totalCustosDivididos = splitExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
                const totalCustos = totalCustosNormais + totalCustosDivididos;

                // 4. Calcular Líquido e Repasses (Via Calculadora Centralizada)
                const {
                    totalBruto,
                    liquido,
                    repasseEmpresa: repasseEmpresaFinal,
                    repasseMotorista: repasseMotoristaFinal,
                    discountCompany,
                    discountDriver
                } = FinancialCalculator.calculateShiftResult({
                    totalApp,
                    totalParticular,
                    totalCustosNormais,
                    totalCustosDivididos,
                    shiftDate: shift.inicio || new Date()
                });

                // 5. Atualizar Turno com TODOS os dados (básicos + financeiros)
                const [updated] = await tx.update(shifts)
                    .set({
                        kmFinal,
                        fim: new Date(),
                        status: 'finalizado',
                        totalApp,
                        totalParticular,
                        totalBruto,
                        totalCorridas,
                        totalCorridasApp,
                        totalCorridasParticular,
                        totalCustos,
                        totalCustosParticular,
                        liquido,
                        repasseEmpresa: repasseEmpresaFinal,
                        repasseMotorista: repasseMotoristaFinal,
                        discountCompany,
                        discountDriver
                    })
                    .where(eq(shifts.id, shiftId))
                    .returning();

                // 6. Atualizar KM do Veículo
                await tx.update(vehicles)
                    .set({
                        kmInicial: kmFinal,
                        currentKm: kmFinal // Also update currentKm
                    })
                    .where(eq(vehicles.id, shift.vehicleId));

                console.log(`✅ Transação completa: Turno finalizado, Veículo atualizado para ${kmFinal} km, Totais calculados.`);

                return updated;
            });

            // Fire-and-forget logic
            FraudService.analyzeShift(shiftId).catch(err => {
                console.error(`[FRAUD] Erro ao analisar turno finalizado ${shiftId}:`, err);
            });

            import("../maintenance/maintenance.service.js").then(({ maintenanceService }) => {
                maintenanceService.checkStatus(shift.vehicleId, kmFinal).catch(err => {
                    console.error(`[MAINTENANCE] Erro ao atualizar status ${shift.vehicleId}:`, err);
                });
            });

            return updatedShift;
        },
        fetchAfter: () => getShiftById(shiftId)
    });
}



export async function recalculateShiftTotals(shiftId: string) {

    console.log(`🔄 Recalculando turno ${shiftId}...`);

    // 1. Buscar Turno
    const shift = await shiftsRepository.findShiftById(shiftId);
    if (!shift) throw new Error("Turno para recálculo não encontrado");

    // 2. Buscar Corridas (por shiftId)
    const ridesData = await db
        .select()
        .from(rides)
        .where(eq(rides.shiftId, shiftId));

    // 3. Buscar Despesas (por shiftId)
    const expensesData = await db
        .select()
        .from(expenses)
        .where(eq(expenses.shiftId, shiftId));

    console.log(`   📦 Expenses encontradas: ${expensesData.length} | Rides: ${ridesData.length}`);

    // 4. Calcular Totais de Receita
    const totalApp = ridesData
        .filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
        .reduce((sum, r) => sum + Number(r.valor || 0), 0);

    const totalParticular = ridesData
        .filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || ''))
        .reduce((sum, r) => sum + Number(r.valor || 0), 0);

    const totalCorridasApp = ridesData.filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;
    const totalCorridasParticular = ridesData.filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).length;

    // 5. Calcular Totais de Custos
    // Separar custos normais de custos divididos (50/50)
    const normalExpenses = expensesData.filter(e => !e.isSplitCost);
    const splitExpenses = expensesData.filter(e => e.isSplitCost);

    const totalCustosParticular = expensesData
        .filter(e => e.isParticular)
        .reduce((sum, e) => sum + Number(e.value || 0), 0);

    const totalCustosNormais = normalExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
    const totalCustosDivididos = splitExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);

    // Total Custos Geral (apenas para registro)
    const totalCustos = totalCustosNormais + totalCustosDivididos;

    console.log(`   💰 Totais Calculados: CustosNormais=${totalCustosNormais}, Divididos=${totalCustosDivididos}, Part=${totalParticular}, App=${totalApp}`);

    // 6. Calcular Líquido e Repasses (Via Calculadora Centralizada)
    const totalCorridas = ridesData.length;

    console.log(`   🧮 Chamando FinancialCalculator para: shiftId=${shiftId}, totalApp=${totalApp}`);
    const result = FinancialCalculator.calculateShiftResult({
        totalApp,
        totalParticular,
        totalCustosNormais,
        totalCustosDivididos,
        shiftDate: shift.inicio || new Date()
    });
    console.log(`   🎯 Resultado Calculator: Empresa=${result.repasseEmpresa}, Motorista=${result.repasseMotorista}, Rule=${result.ruleUsed}`);

    // 7. Atualizar Turno
    const updatedShift = await shiftsRepository.updateShift(shiftId, {
        totalApp,
        totalParticular,
        totalBruto: result.totalBruto,
        totalCorridas,
        totalCorridasApp,
        totalCorridasParticular,
        totalCustos, // Mantém o total geral para histórico
        totalCustosParticular,
        liquido: result.liquido,
        repasseEmpresa: result.repasseEmpresa,
        repasseMotorista: result.repasseMotorista,
        discountCompany: result.discountCompany,
        discountDriver: result.discountDriver
    });

    console.log("✅ Turno atualizado com sucesso.");
    return updatedShift;
}

export async function getShiftById(id: string) {
    const shift = await shiftsRepository.findShiftById(id);
    if (shift) {
        return shift;
    }
    return null;
}

export async function getOpenShift(driverId: string) {
    const shift = await shiftsRepository.findOpenShiftByDriver(driverId);
    return shift;
}

export async function updateShift(id: string, data: any, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-update-shift');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.UPDATE_SHIFT,
        entity: 'shifts',
        entityId: id,
        operation: 'UPDATE',
        context: auditContext,
        fetchBefore: () => getShiftById(id),
        execute: async () => {
            try {
                console.log('[updateShift] Received data:', JSON.stringify(data, null, 2));

                const cleanData = { ...data };

                // Helper para garantir que temos um Date object ou undefined
                const toDateObject = (val: any): Date | undefined => {
                    if (!val) return undefined;
                    if (val instanceof Date) return val;
                    if (typeof val === 'string') return new Date(val);
                    return undefined;
                };

                if (cleanData.inicio !== undefined) {
                    cleanData.inicio = toDateObject(cleanData.inicio);
                }
                if (cleanData.fim !== undefined) {
                    cleanData.fim = toDateObject(cleanData.fim);

                    // Auto-finalize
                    if (cleanData.fim && cleanData.status === undefined) {
                        const currentShift = await shiftsRepository.findShiftById(id);
                        if (currentShift && currentShift.status === 'em_andamento') {
                            cleanData.status = 'finalizado';
                            console.log('[updateShift] Auto-finalizing shift since fim was set');
                        }
                    }
                }

                console.log('[updateShift] Clean data:', JSON.stringify(cleanData, null, 2));

                const result = await shiftsRepository.updateShift(id, cleanData);
                console.log('[updateShift] Result:', JSON.stringify(result, null, 2));

                // Re-analyze fraud
                console.log(`[FRAUD] Re-analizando turno ${id} após atualização...`);
                FraudService.analyzeShift(id).catch(err => {
                    console.error(`[FRAUD] Erro ao re-analisar turno ${id}:`, err);
                });

                return result;

            } catch (error: any) {
                console.error('[updateShift] CRITICAL ERROR:', error);
                throw error;
            }
        },
        fetchAfter: () => getShiftById(id)
    });
}

/**
 * Admin Close Shift - Encerra um turno manualmente (área administrativa)
 */
export async function adminCloseShift(id: string, fim: Date, kmFinal: number, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-admin-close-shift');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.FINISH_SHIFT, // Semanticamente é um finish, mas forçado por admin
        entity: 'shifts',
        entityId: id,
        operation: 'UPDATE',
        context: auditContext,
        fetchBefore: () => getShiftById(id),
        execute: async () => {
            console.log('[adminCloseShift] Starting...', { id, fim, kmFinal });

            const currentShift = await shiftsRepository.findShiftById(id);
            if (!currentShift) {
                throw new Error('Turno não encontrado');
            }

            if (currentShift.status === 'finalizado') {
                throw new Error('Este turno já está finalizado');
            }

            // Validar timestamp última corrida
            const lastRideResult = await db
                .select({ hora: rides.hora })
                .from(rides)
                .where(eq(rides.shiftId, id))
                .orderBy(sql`${rides.hora} DESC`)
                .limit(1);

            const lastRide = lastRideResult[0];
            let warning: string | undefined;

            if (lastRide && lastRide.hora) {
                const lastRideTime = new Date(lastRide.hora);
                if (fim < lastRideTime) {
                    warning = `Atenção: O horário de fim (${fim.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}) é anterior à última corrida (${lastRideTime.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}). O turno foi encerrado mesmo assim.`;
                    console.warn('[adminCloseShift] WARNING:', warning);
                }
            }

            const updatedShift = await shiftsRepository.updateShift(id, {
                fim: fim,
                kmFinal: kmFinal,
                status: 'finalizado'
            });

            console.log('[adminCloseShift] Shift closed successfully');

            try {
                await recalculateShiftTotals(id);
                console.log('[adminCloseShift] Totals recalculated');
            } catch (calcError) {
                console.error('[adminCloseShift] Error recalculating totals:', calcError);
            }

            FraudService.analyzeShift(id).catch(err => {
                console.error(`[adminCloseShift] Fraud analysis error:`, err);
            });

            return { shift: updatedShift, warning };
        },
        fetchAfter: async () => {
            const s = await getShiftById(id);
            return { shift: s }; // Retorna estrutura {shift, warning} é complexo no diff, mas o objeto principal é o shift.
            // O withAudit espera comparar Before e After. Before era Shift. After deve ser Shift.
            // O execute retorna {shift, warning}.
            // Se execute retorna wrapper, o after deve retornar wrapper ou o diff vai ser estranho.
            // O ideal é logar o shift.
            // Ajuste: fetchAfter retorna o shift. O resultado da função é {shift, warning}.
        }
    });
}

export async function deleteShift(id: string, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('legacy-delete-shift');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.DELETE_SHIFT,
        entity: 'shifts',
        entityId: id,
        operation: 'DELETE', // Operação é DELETE
        context: auditContext,
        fetchBefore: () => getShiftById(id),
        execute: async () => {
            return await shiftsRepository.deleteShift(id);
        },
        // fetchAfter não é necessário para DELETE (será null)
    });
}

/**
 * Create Manual Shift - Cria turno retroativo completo (Admin only)
 * Cria o turno já finalizado + corridas + custos em uma transação
 */
interface ManualShiftData {
    driverId: string;
    vehicleId: string;
    kmInicial: number;
    kmFinal: number;
    inicio: Date;
    fim: Date;
    rides: { hora: string; valor: number; tipo: string }[];
    expenses: { hora?: string; costTypeId: string; value: number; description?: string }[];
}

export async function createManualShift(data: ManualShiftData, context?: AuditContext) {
    const auditContext = context || auditService.createSystemContext('admin-create-manual-shift');

    return auditService.withAudit({
        action: AUDIT_ACTIONS.START_SHIFT,
        entity: 'shifts',
        entityId: 'manual-new',
        operation: 'INSERT',
        context: auditContext,
        execute: async () => {
            return await db.transaction(async (tx) => {
                console.log('[createManualShift] Starting transaction...', data);

                // 1. Criar o turno básico (já finalizado)
                // Calcular duração em minutos
                const duracaoMs = new Date(data.fim).getTime() - new Date(data.inicio).getTime();
                const duracaoMin = Math.round(duracaoMs / 60000);

                const [newShift] = await tx.insert(shifts).values({
                    driverId: data.driverId,
                    vehicleId: data.vehicleId,
                    kmInicial: data.kmInicial,
                    kmFinal: data.kmFinal,
                    inicio: data.inicio,
                    fim: data.fim,
                    duracaoMin: duracaoMin,
                    status: 'finalizado'
                    // Nota: campo 'origem' removido pois não existe no schema
                }).returning();

                console.log('[createManualShift] Shift created:', newShift.id);

                // 2. Inserir corridas
                if (data.rides && data.rides.length > 0) {
                    await tx.insert(rides).values(
                        data.rides.map(r => ({
                            shiftId: newShift.id,
                            hora: new Date(r.hora),
                            valor: String(r.valor), // rides.valor is string in schema
                            tipo: r.tipo
                        }))
                    );
                    console.log(`[createManualShift] Inserted ${data.rides.length} rides`);
                }

                // 3. Inserir custos/despesas
                if (data.expenses && data.expenses.length > 0) {
                    await tx.insert(expenses).values(
                        data.expenses.map(e => ({
                            shiftId: newShift.id,
                            costTypeId: e.costTypeId,
                            value: String(e.value), // expenses.value is string in schema
                            date: e.hora ? new Date(e.hora) : data.inicio, // campo 'date' é obrigatório
                            notes: e.description || null
                        }))
                    );
                    console.log(`[createManualShift] Inserted ${data.expenses.length} expenses`);
                }

                // 4. Atualizar KM do veículo
                await tx.update(vehicles)
                    .set({
                        kmInicial: data.kmFinal,
                        currentKm: data.kmFinal
                    })
                    .where(eq(vehicles.id, data.vehicleId));

                console.log(`[createManualShift] Vehicle KM updated to ${data.kmFinal}`);

                return newShift;
            });
        },
        fetchAfter: async (result) => {
            if (result && result.id) {
                // Recalcular totais financeiros
                try {
                    await recalculateShiftTotals(result.id);
                    console.log('[createManualShift] Totals recalculated');
                } catch (err) {
                    console.error('[createManualShift] Error recalculating:', err);
                }

                // Analisar fraude
                FraudService.analyzeShift(result.id).catch(err => {
                    console.error(`[createManualShift] Fraud analysis error:`, err);
                });

                return await getShiftById(result.id);
            }
            return result;
        }
    });
}
