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
    // Check if driver already has open shift
    const openShift = await shiftsRepository.findOpenShiftByDriver(driverId);
    if (openShift) {
        throw new Error("Motorista já possui um turno aberto.");
    }

    // Validação de KM Progressivo

    const vehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, vehicleId)
    });

    if (vehicle && kmInicial < vehicle.kmInicial) {
        throw new Error(`KM inválido! O veículo está com ${vehicle.kmInicial} Km. Você informou ${kmInicial} Km.`);
    }

    // REGRA: Veículo não pode estar em uso por outro motorista
    const vehicleInUse = await db.query.shifts.findFirst({
        where: (s, { and, eq }) => and(eq(s.vehicleId, vehicleId), eq(s.status, 'em_andamento'))
    });

    if (vehicleInUse) {
        throw new Error(`Este veículo já está em uso em outro turno. Finalize o turno anterior antes de iniciar um novo.`);
    }

    const newShift = await shiftsRepository.createShift({
        driverId,
        vehicleId,
        kmInicial,
        inicio: new Date(),
        status: 'em_andamento'
    });

    return newShift;
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

    // 7. Atualizar Turno
    const updatedShift = await shiftsRepository.updateShift(shiftId, {
        totalApp,
        totalParticular,
        totalBruto,
        totalCorridas,
        totalCorridasApp,
        totalCorridasParticular,
        totalCustos, // Mantém o total geral para histórico
        totalCustosParticular,
        liquido, // Mostra o líquido base ou final? O dashboard calcula via Bruto - Custos. 
        // Se salvarmos 'liquido' diferente de (Bruto - TotalCustos), pode confundir o front existente.
        // Mas a regra mudou. Vamos salvar o Líquido Base (que gerou o 60/40) para coerência matemática interna?
        // Ou o Líquido Real (o que sobrou no final)? 
        // Vamos salvar o Líquido usado para a base 60/40 para que os percentuais façam sentido se alguém conferir.
        repasseEmpresa: repasseEmpresaFinal,
        repasseMotorista: repasseMotoristaFinal,
        discountCompany,
        discountDriver
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
    console.log('[updateShift] Received data:', JSON.stringify(data, null, 2));

    // Converter Date objects para strings ISO se necessário
    const cleanData = { ...data };
    if (cleanData.inicio instanceof Date) {
        cleanData.inicio = cleanData.inicio.toISOString();
    }
    if (cleanData.fim instanceof Date) {
        cleanData.fim = cleanData.fim.toISOString();
    }

    console.log('[updateShift] Clean data:', JSON.stringify(cleanData, null, 2));

    // Se está alterando a data de início, precisamos ajustar as corridas
    if (cleanData.inicio) {
        const currentShift = await shiftsRepository.findShiftById(id);
        if (currentShift && currentShift.inicio) {
            const oldStart = new Date(currentShift.inicio);
            const newStart = new Date(cleanData.inicio);
            const timeDiffMs = newStart.getTime() - oldStart.getTime();

            console.log('[updateShift] Time diff:', timeDiffMs, 'ms');

            // Se houver diferença de tempo, atualizar todas as corridas
            if (timeDiffMs !== 0) {

                // Atualiza todas as corridas do turno, aplicando o mesmo deslocamento
                await db.update(rides)
                    .set({
                        hora: sql`${rides.hora} + INTERVAL '${timeDiffMs} milliseconds'`
                    })
                    .where(eq(rides.shiftId, id));

                console.log('[updateShift] Updated ride timestamps');
            }
        }
    }

    const result = await shiftsRepository.updateShift(id, cleanData);
    console.log('[updateShift] Result:', JSON.stringify(result, null, 2));

    // Re-analyze fraud if shift is finalized (status === 'finalizado')
    // We fetch again or use result to check status? result likely has status if updated, 
    // but better check fresh from DB or if result has it. 
    // shiftsRepository.updateShift returns the updated shift usually.
    // Let's safe check by fetching.
    const updatedResult = await shiftsRepository.findShiftById(id);
    if (updatedResult?.status === 'finalizado') {
        console.log(`[FRAUD] Re-analisando turno finalizado ${id} após atualização...`);
        FraudService.analyzeShift(id).catch(err => {
            console.error(`[FRAUD] Erro ao re-analisar turno ${id}:`, err);
        });
    }

    return result;
}

export async function deleteShift(id: string) {
    return await shiftsRepository.deleteShift(id);
}
