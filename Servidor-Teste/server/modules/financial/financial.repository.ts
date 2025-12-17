
import { db } from "../../core/db/connection.js";
import { expenses, costTypes, fixedCosts, drivers, shifts, vehicles, legacyMaintenances } from "../../../shared/schema.js";
import { eq, desc, and } from "drizzle-orm";

export async function findAllExpenses(filters?: { shiftId?: string }) {
    const whereConditions = [];
    if (filters?.shiftId) whereConditions.push(eq(expenses.shiftId, filters.shiftId));

    return await db
        .select({
            id: expenses.id,
            valor: expenses.value,
            data: expenses.date,
            notes: expenses.notes,
            tipo: costTypes.name,
            categoria: costTypes.category,
            tipoCor: costTypes.description,
            motorista: drivers.nome,
            shiftId: expenses.shiftId,
            veiculo: vehicles.plate,
            modelo: vehicles.modelo,
        })
        .from(expenses)
        .leftJoin(costTypes, eq(expenses.costTypeId, costTypes.id))
        .leftJoin(drivers, eq(expenses.driverId, drivers.id))
        .leftJoin(shifts, eq(expenses.shiftId, shifts.id))
        .leftJoin(vehicles, eq(shifts.vehicleId, vehicles.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(expenses.date));
}

export async function findAllCostTypes() {
    return await db.select().from(costTypes);
}

export async function findAllFixedCosts() {
    return await db.select().from(fixedCosts);
}

export async function createExpense(data: typeof expenses.$inferInsert) {
    const [newExpense] = await db.insert(expenses).values(data).returning();
    return newExpense;
}

export async function createCostType(data: typeof costTypes.$inferInsert) {
    const [newType] = await db.insert(costTypes).values(data).returning();
    return newType;
}

export async function updateCostType(id: string, data: Partial<typeof costTypes.$inferInsert>) {
    const [updatedType] = await db.update(costTypes).set(data).where(eq(costTypes.id, id)).returning();
    return updatedType;
}

export async function deleteCostType(id: string) {
    await db.delete(costTypes).where(eq(costTypes.id, id));
    return true;
}

export async function findAllLegacyMaintenances() {
    return await db
        .selectDistinct({
            id: legacyMaintenances.id,
            valor: legacyMaintenances.value,
            data: legacyMaintenances.date,
            notes: legacyMaintenances.description,
            tipo: legacyMaintenances.type,
            km: legacyMaintenances.km,
            veiculoId: legacyMaintenances.vehicleId,
            veiculoPlate: vehicles.plate,
            veiculoModelo: vehicles.modelo
        })
        .from(legacyMaintenances)
        .leftJoin(vehicles, eq(legacyMaintenances.vehicleId, vehicles.id))
        .orderBy(desc(legacyMaintenances.date));
}

export async function restoreDefaultCostTypes() {
    const defaults = [
        { name: 'Combustível', category: 'Variável', description: 'Abastecimento', icon: 'fuel', color: 'orange' },
        { name: 'Manutenção', category: 'Variável', description: 'Reparos', icon: 'wrench', color: 'red' },
        { name: 'Alimentação', category: 'Variável', description: 'Refeições', icon: 'utensils', color: 'green' },
        { name: 'Limpeza', category: 'Variável', description: 'Lavagem', icon: 'droplet', color: 'blue' },
        { name: 'Pedágio', category: 'Variável', description: 'Despesas de viagem', icon: 'ticket', color: 'yellow' },
    ];

    for (const d of defaults) {
        // Simple check to avoid duplicates by name
        const existing = await db.select().from(costTypes).where(eq(costTypes.name, d.name)).limit(1);
        if (existing.length === 0) {
            await db.insert(costTypes).values(d);
        }
    }
    return true;
}
