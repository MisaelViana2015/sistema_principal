import * as shiftsRepository from "./shifts.repository.js";
import { FraudService } from "../fraud/fraud.service.js";
import { FinancialCalculator } from "../financial/FinancialCalculator.js";
import { db } from "../../core/db/connection.js";
import { shifts, vehicles, rides, expenses } from "../../../shared/schema.js";
import { eq, sql } from "drizzle-orm";

export async function getAllShifts(page: number, limit: number, filters: any) {
    return await shiftsRepository.findAllShifts(page, limit, filters);
}

export async function startShift(driverId: string, vehicleId: string, kmInicial: number) {
    return await db.transaction(async (tx) => {
        // Check if driver already has open shift
        const openShift = await shiftsRepository.findOpenShiftByDriver(driverId); // Repository uses db, might need tx version
        // Ideally pass tx to repo, but for now re-implementing check or hoping repo check is fast.
        // Better: Re-query inside tx for "FOR UPDATE"?
        // Simpler for now: Check logic inside transaction.

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
}

export async function finishShift(shiftId: string, kmFinal: number) {
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

        // 3. Calcular Totais de Custos
        const normalExpenses = expensesData.filter(e => !e.isSplitCost);
        const splitExpenses = expensesData.filter(e => e.isSplitCost);
        const totalCustosParticular = expensesData.filter(e => e.isParticular).reduce((sum, e) => sum + Number(e.value || 0), 0);
        const totalCustosNormais = normalExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
        const totalCustosDivididos = splitExpenses.reduce((sum, e) => sum + Number(e.value || 0), 0);
        const totalCustos = totalCustosNormais + totalCustosDivididos;

        // 4. Calcular Líquido e Repasses (Via Calculadora Centralizada)
        const totalCorridas = ridesData.length;

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

    // Fire-and-forget Fraud Analysis
    // Não aguardamos o resultado para não bloquear a resposta ao motorista
    FraudService.analyzeShift(shiftId).catch(err => {
        console.error(`[FRAUD] Erro ao analisar turno finalizado ${shiftId}:`, err);
    });

    // Atualizar Status das Manutenções (Fire-and-forget)
    import("../maintenance/maintenance.service.js").then(({ maintenanceService }) => {
        maintenanceService.checkStatus(shift.vehicleId, kmFinal).catch(err => {
            console.error(`[MAINTENANCE] Erro ao atualizar status ${shift.vehicleId}:`, err);
        });
    });

    return updatedShift;

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

    // totalCustos (para fins de histórico) pode ser tudo, mas para o LÍQUIDO da regra 60/40, 
    // usamos o bruto menos TODOS os custos?
    // REGRA DO CLIENTE: "O custo quando marcado... ela irá fazer com que cada um pague 50%... por isso pedi que tenha dois campos de custo lá no início"
    // INTERPRETAÇÃO:
    // O custo dividido NÃO deve ser abatido do BRUTO para gerar o LÍQUIDO da base 60/40.
    // Se abatermos do bruto, a empresa paga 60% e o motorista 40% desse custo.
    // Queremos 50/50.
    // Então: LíquidoBase = Bruto - CustosNormais
    // RepasseEmpresaBase = LíquidoBase * 0.60
    // RepasseMotoristaBase = LíquidoBase * 0.40
    // DescontoEmpresa = CustoDividido * 0.50
    // DescontoMotorista = CustoDividido * 0.50
    // RepasseFinal = RepasseBase - Desconto

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
        // Optional: Recalculate to ensure freshness?
        // await recalculateShiftTotals(shift.id);
        // Better return as is, explicit recalc is expensive.
        // But for editing, maybe we want fresh data?
        // Let's just return it.
        return shift;
    }
    return null;
}

export async function getOpenShift(driverId: string) {
    const shift = await shiftsRepository.findOpenShiftByDriver(driverId);
    // REMOVIDO: Auto-heal (Recálculo automático) em load. 
    // Motivo: Performance. O recálculo já ocorre em ações de escrita (start/finish/add ride).
    return shift;
}

export async function updateShift(id: string, data: any) {
    try {
        console.log('[updateShift] Received data:', JSON.stringify(data, null, 2));

        // Converter Date objects para strings ISO se necessário
        // Também garantir que strings se mantenham como strings
        const cleanData = { ...data };

        // Helper para garantir que temos uma string ISO ou undefined
        const toISOStringOrKeep = (val: any): string | undefined => {
            if (!val) return undefined;
            if (val instanceof Date) return val.toISOString();
            if (typeof val === 'string') return val; // já é string
            return undefined;
        };

        if (cleanData.inicio !== undefined) {
            cleanData.inicio = toISOStringOrKeep(cleanData.inicio);
        }
        if (cleanData.fim !== undefined) {
            cleanData.fim = toISOStringOrKeep(cleanData.fim);
        }

        console.log('[updateShift] Clean data:', JSON.stringify(cleanData, null, 2));

        // TEMPORARILY DISABLED: Ride timestamp update logic
        // TODO: Re-enable after fixing the SQL issue
        /*
        // Se está alterando a data de início, precisamos ajustar as corridas
        if (cleanData.inicio) {
            const currentShift = await shiftsRepository.findShiftById(id);
            if (currentShift && currentShift.inicio) {
                const oldStart = new Date(currentShift.inicio);
                const newStart = new Date(cleanData.inicio);
                const timeDiffMs = newStart.getTime() - oldStart.getTime();

                console.log('[updateShift] Time diff:', timeDiffMs, 'ms');

                // Se houver diferença de tempo e for válido, atualizar todas as corridas
                if (timeDiffMs !== 0 && !isNaN(timeDiffMs)) {
                    console.log('[updateShift] Updating ride timestamps...');
                    
                    // Use make_interval for robust interval calculation with numeric parameter
                    // make_interval(secs => float)
                    const diffSeconds = timeDiffMs / 1000.0;

                    await db.update(rides)
                        .set({
                            hora: sql`${rides.hora} + make_interval(secs => ${diffSeconds})`
                        })
                        .where(eq(rides.shiftId, id));

                    console.log('[updateShift] Updated ride timestamps');
                } else if (isNaN(timeDiffMs)) {
                    console.warn('[updateShift] Invalid date calculation, skipping ride update. oldStart:', oldStart, 'newStart:', newStart);
                }
            }
        }
        */

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
}

export async function deleteShift(id: string) {
    return await shiftsRepository.deleteShift(id);
}
