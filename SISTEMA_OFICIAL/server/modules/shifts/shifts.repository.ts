import { db } from "../../core/db/connection.js";
import { shifts, drivers, vehicles, rides, expenses } from "../../../shared/schema.js";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export async function findAllShifts(page = 1, limit = 50, filters?: any) {
    const offset = (page - 1) * limit;

    // Build where clause
    const whereConditions = [];
    if (filters?.driverId) whereConditions.push(eq(shifts.driverId, filters.driverId));
    if (filters?.vehicleId) whereConditions.push(eq(shifts.vehicleId, filters.vehicleId));
    if (filters?.status && filters.status !== 'todos') whereConditions.push(eq(shifts.status, filters.status));

    // Date filters
    if (filters?.startDate) whereConditions.push(gte(shifts.inicio, new Date(filters.startDate)));
    if (filters?.endDate) whereConditions.push(lte(shifts.inicio, new Date(filters.endDate)));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get Total Count
    const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(shifts)
        .where(whereClause);
    const total = Number(totalResult[0]?.count || 0);

    // Get Data
    const results = await db
        .select({
            id: shifts.id,
            motorista: drivers.nome,
            driverId: shifts.driverId, // Needed for robust filter/display
            veiculo: vehicles.plate,
            vehicleId: shifts.vehicleId, // Needed for robust filter/display
            veiculoModelo: vehicles.modelo,
            inicio: shifts.inicio,
            fim: shifts.fim,
            status: shifts.status,
            kmRodado: shifts.kmFinal,
            kmInicial: shifts.kmInicial,
            receita: shifts.totalBruto,
            totalApp: shifts.totalApp,
            totalParticular: shifts.totalParticular,
            totalCorridasApp: shifts.totalCorridasApp,
            totalCorridasParticular: shifts.totalCorridasParticular,
            totalCorridas: shifts.totalCorridas,
            // Financials (Added)
            totalCustos: shifts.totalCustos,
            totalCustosParticular: shifts.totalCustosParticular,
            liquido: shifts.liquido,
            repasseEmpresa: shifts.repasseEmpresa,
            repasseMotorista: shifts.repasseMotorista,
        })
        .from(shifts)
        .leftJoin(drivers, eq(shifts.driverId, drivers.id))
        .leftJoin(vehicles, eq(shifts.vehicleId, vehicles.id))
        .where(whereClause)
        .orderBy(desc(shifts.inicio))
        .limit(limit)
        .offset(offset);

    const processedResults = results.map((shift: any) => ({
        ...shift,
        kmRodado: shift.kmRodado && shift.kmInicial ? (shift.kmRodado - shift.kmInicial) : 0
    }));

    return {
        data: processedResults,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function createShift(data: any) {
    const [newShift] = await db.insert(shifts).values(data).returning();
    return newShift;
}

export async function updateShift(id: string, data: any) {
    console.log('[shiftsRepository.updateShift] Received data:', JSON.stringify(data, null, 2));

    // Build update object using schema field references
    const updateData: Record<string, any> = {};

    if (data.kmInicial !== undefined) updateData.kmInicial = data.kmInicial;
    if (data.kmFinal !== undefined) updateData.kmFinal = data.kmFinal;
    if (data.inicio !== undefined) updateData.inicio = data.inicio;
    if (data.fim !== undefined) updateData.fim = data.fim;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.driverId !== undefined) updateData.driverId = data.driverId;
    if (data.vehicleId !== undefined) updateData.vehicleId = data.vehicleId;
    if (data.totalApp !== undefined) updateData.totalApp = data.totalApp;
    if (data.totalParticular !== undefined) updateData.totalParticular = data.totalParticular;
    if (data.totalBruto !== undefined) updateData.totalBruto = data.totalBruto;
    if (data.totalCustos !== undefined) updateData.totalCustos = data.totalCustos;
    if (data.liquido !== undefined) updateData.liquido = data.liquido;
    if (data.repasseEmpresa !== undefined) updateData.repasseEmpresa = data.repasseEmpresa;
    if (data.repasseMotorista !== undefined) updateData.repasseMotorista = data.repasseMotorista;
    if (data.totalCorridas !== undefined) updateData.totalCorridas = data.totalCorridas;
    if (data.totalCorridasApp !== undefined) updateData.totalCorridasApp = data.totalCorridasApp;
    if (data.totalCorridasParticular !== undefined) updateData.totalCorridasParticular = data.totalCorridasParticular;
    if (data.duracaoMin !== undefined) updateData.duracaoMin = data.duracaoMin;
    if (data.valorKm !== undefined) updateData.valorKm = data.valorKm;

    console.log('[shiftsRepository.updateShift] Update data:', JSON.stringify(updateData, null, 2));

    const [updatedShift] = await db
        .update(shifts)
        .set(updateData)
        .where(eq(shifts.id, id))
        .returning();
    return updatedShift;
}

export async function findShiftById(id: string) {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
}

export async function findOpenShiftByDriver(driverId: string) {
    const [shift] = await db
        .select()
        .from(shifts)
        .where(and(eq(shifts.driverId, driverId), eq(shifts.status, 'em_andamento')))
        .limit(1);
    return shift;
}

export async function findLastShiftByDriver(driverId: string) {
    const [shift] = await db
        .select()
        .from(shifts)
        .where(eq(shifts.driverId, driverId))
        .orderBy(desc(shifts.inicio))
        .limit(1);
    return shift;
}


export async function deleteShift(id: string) {
    // Delete dependent records
    await db.delete(rides).where(eq(rides.shiftId, id));
    await db.delete(expenses).where(eq(expenses.shiftId, id));

    // Delete shift
    await db.delete(shifts).where(eq(shifts.id, id));
}
