
import * as shiftsRepository from "./shifts.repository.js";

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
    const { db } = await import("../../core/db/connection.js");
    const { vehicles } = await import("../../../shared/schema.js");
    const { eq } = await import("drizzle-orm");

    const vehicle = await db.query.vehicles.findFirst({
        where: eq(vehicles.id, vehicleId)
    });

    if (vehicle && kmInicial < vehicle.kmInicial) {
        throw new Error(`KM inválido! O veículo está com ${vehicle.kmInicial} Km. Você informou ${kmInicial} Km.`);
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

    // Atualiza dados básicos de finalização primeiro
    await shiftsRepository.updateShift(shiftId, {
        kmFinal,
        fim: new Date(),
        status: 'finalizado',
    });

    // Recalcula totais (financeiro)
    return await recalculateShiftTotals(shiftId);
}



export async function recalculateShiftTotals(shiftId: string) {
    const { db } = await import("../../core/db/connection.js");
    const { rides, shifts, expenses } = await import("../../../shared/schema.js");
    const { eq } = await import("drizzle-orm");

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
    const totalCustosParticular = expensesData
        .filter(e => e.isParticular)
        .reduce((sum, e) => sum + Number(e.value || 0), 0);

    const totalCustos = expensesData.reduce((sum, e) => sum + Number(e.value || 0), 0);

    console.log(`   💰 Totais Calculados: Custos=${totalCustos}, Part=${totalParticular}, App=${totalApp}`);

    const totalBruto = totalApp + totalParticular;
    const totalCorridas = ridesData.length;

    // 6. Calcular Líquido e Repasses (50/50 do Líquido)
    const liquido = totalBruto - totalCustos;
    const repasseEmpresa = liquido * 0.5; // Ajuste para 50/50 se for a regra do cliente, ou manter logica
    // O cliente mencionou Empresas 60% e Motorista 40% nas imagens.
    // O código anterior estava 0.5 (50%), mas a imagem mostra 60/40.
    // IMAGEM: Liquido 50. Empresa 30 (60%). Motorista 20 (40%).

    // CORREÇÃO DA REGRA DE NEGÓCIO: 60/40
    const repasseEmpresaFinal = liquido * 0.60;
    const repasseMotoristaFinal = liquido * 0.40;

    // 7. Atualizar Turno
    const updatedShift = await shiftsRepository.updateShift(shiftId, {
        totalApp,
        totalParticular,
        totalBruto,
        totalCorridas,
        totalCorridasApp,
        totalCorridasParticular,
        totalCustos,
        totalCustosParticular,
        liquido,
        // repasseEmpresa: Number(repasseEmpresaFinal.toFixed(2)), // toFixed retorna string
        // Drizzle numeric lida com string ou number.
        repasseEmpresa: repasseEmpresaFinal,
        repasseMotorista: repasseMotoristaFinal
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
    // Auto-heal: Recalcula totais ao carregar para garantir consistência
    if (shift) {
        // executa em background para não travar a resposta? Não, melhor esperar para garantir dados frescos.
        try {
            return await recalculateShiftTotals(shift.id);
        } catch (e) {
            console.error("Erro no auto-recalc:", e);
        }
    }
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
                const { db } = await import('../../core/db/connection.js');
                const { rides } = await import('../../../shared/schema.js');
                const { eq, sql } = await import('drizzle-orm');

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
    return result;
}

export async function deleteShift(id: string) {
    return await shiftsRepository.deleteShift(id);
}
