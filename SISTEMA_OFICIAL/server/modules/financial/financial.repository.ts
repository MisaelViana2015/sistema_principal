
import { db } from "../../core/db/connection.js";
import { expenses, costTypes, fixedCosts, fixedCostInstallments, drivers, shifts, vehicles, legacyMaintenances, legacyShiftCostTypes } from "../../../shared/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";

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
            shiftId: expenses.shiftId,
            motoristaNome: drivers.nome, // Add driver name
        })
        .from(expenses)
        .leftJoin(costTypes, eq(expenses.costTypeId, costTypes.id))
        .leftJoin(shifts, eq(expenses.shiftId, shifts.id)) // Join shifts
        .leftJoin(drivers, eq(shifts.driverId, drivers.id)) // Join drivers via shift
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(expenses.date));
}

export async function findAllCostTypes() {
    return await db.select().from(costTypes);
}

export async function findAllFixedCosts() {
    return await db.select().from(fixedCosts);
}

export async function createFixedCost(data: typeof fixedCosts.$inferInsert) {
    const [newCost] = await db.insert(fixedCosts).values(data).returning();

    // Generate Installments if totalInstallments > 0
    console.log("Creating Fixed Cost - Logic Check:", {
        id: newCost.id,
        totalInstallments: newCost.totalInstallments,
        startDate: newCost.startDate
    });

    if (newCost.totalInstallments && newCost.totalInstallments > 0 && newCost.startDate) {
        console.log("Generating installments...");
        const installments = [];
        const start = new Date(newCost.startDate);
        const day = newCost.dueDay || 5;

        for (let i = 0; i < newCost.totalInstallments; i++) {
            const dueDate = new Date(start);
            dueDate.setMonth(dueDate.getMonth() + i);
            dueDate.setDate(Math.min(day, 28)); // Safe day to avoid Feb 30 issues

            installments.push({
                fixedCostId: newCost.id,
                installmentNumber: i + 1,
                dueDate: dueDate,
                value: newCost.value,
                status: 'Pendente',
            });
        }

        // Batch insert might need loop if too big, but 60-96 is fine
        if (installments.length > 0) {
            await db.insert(fixedCostInstallments).values(installments);
        }
    } else {
        // If recurring forever (no totalInstallments), we might create just the next 12 months for dashboard visibility
        // For now, let's just stick to specific finite loans or handle indefinite later.
        // Or create 12 months ahead for visual.
        const installments = [];
        const now = new Date();
        const day = newCost.dueDay || 5;

        for (let i = 0; i < 12; i++) {
            const dueDate = new Date(now.getFullYear(), now.getMonth() + i, Math.min(day, 28));
            installments.push({
                fixedCostId: newCost.id,
                installmentNumber: i + 1,
                dueDate: dueDate,
                value: newCost.value,
                status: 'Pendente',
            });
        }
        await db.insert(fixedCostInstallments).values(installments);
    }

    return newCost;
}

export async function updateFixedCost(id: string, data: Partial<typeof fixedCosts.$inferInsert>) {
    const [updated] = await db.update(fixedCosts).set(data).where(eq(fixedCosts.id, id)).returning();
    // Logic to update future installments if value changed? Complex. 
    // For now, just update the template.
    return updated;
}

export async function deleteFixedCost(id: string) {
    // Delete installments first
    await db.delete(fixedCostInstallments).where(eq(fixedCostInstallments.fixedCostId, id));
    const [deleted] = await db.delete(fixedCosts).where(eq(fixedCosts.id, id)).returning();
    return deleted;
}

export async function updateFixedCostInstallment(id: string, data: { status?: string, value?: number, dueDate?: Date, paidDate?: Date, paidAmount?: number }) {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.value !== undefined) updateData.value = String(data.value);
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.paidDate !== undefined) updateData.paidDate = data.paidDate;
    if (data.paidAmount !== undefined) updateData.paidAmount = String(data.paidAmount);

    const [updated] = await db.update(fixedCostInstallments)
        .set(updateData)
        .where(eq(fixedCostInstallments.id, id))
        .returning();
    return updated;
}

export async function getFixedCostInstallments(filters?: { month?: string, year?: string, status?: string }) {
    const conditions = [];

    if (filters?.year && filters.year !== 'todos') {
        conditions.push(sql`EXTRACT(YEAR FROM ${fixedCostInstallments.dueDate}) = ${filters.year}`);
    }

    if (filters?.month && filters.month !== 'todos') {
        // Handle month name or number
        const monthMap: Record<string, number> = {
            'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
            'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12,
            'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4, 'Maio': 5, 'Junho': 6,
            'Julho': 7, 'Agosto': 8, 'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
        };

        let monthNum = parseInt(filters.month);
        if (isNaN(monthNum)) {
            monthNum = monthMap[filters.month] || 0;
        }

        if (monthNum > 0) {
            conditions.push(sql`EXTRACT(MONTH FROM ${fixedCostInstallments.dueDate}) = ${monthNum}`);
        }
    }

    if (filters?.status && filters.status !== 'todos') {
        conditions.push(eq(fixedCostInstallments.status, filters.status));
    }

    return await db.select({
        id: fixedCostInstallments.id,
        fixedCostId: fixedCostInstallments.fixedCostId,
        costName: fixedCosts.name,
        vendor: fixedCosts.vendor,
        vehicleId: fixedCosts.vehicleId,
        installmentNumber: fixedCostInstallments.installmentNumber,
        totalInstallments: fixedCosts.totalInstallments,
        dueDate: fixedCostInstallments.dueDate,
        value: fixedCostInstallments.value,
        status: fixedCostInstallments.status,
    })
        .from(fixedCostInstallments)
        .leftJoin(fixedCosts, eq(fixedCostInstallments.fixedCostId, fixedCosts.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(fixedCostInstallments.dueDate);
}

export async function getExpenseById(id: string) {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
}

export async function createExpense(data: typeof expenses.$inferInsert) {
    const [newExpense] = await db.insert(expenses).values(data).returning();
    return newExpense;
}

export async function updateExpense(id: string, data: Partial<typeof expenses.$inferInsert>) {
    const [updated] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return updated;
}

export async function deleteExpense(id: string) {
    const [deleted] = await db.delete(expenses).where(eq(expenses.id, id)).returning();
    return deleted;
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
    // First, try to migrate from legacy table
    let legacyTypes = await db.select().from(legacyShiftCostTypes);

    // If DB is empty, use hardcoded values extracted from backup
    if (legacyTypes.length === 0) {
        console.log("Legacy table empty in DB. Using hardcoded backup data.");
        legacyTypes = [
            { name: 'Recarga APP', icon: 'zap', colorToken: 'blue', isDefault: true, id: '9968e127-31f2-48b3-816c-53d83c7e0492', createdAt: null },
            { name: 'Recarga Carro', icon: 'car', colorToken: 'green', isDefault: true, id: '8eedc353-661d-4019-9795-59ebb1f4b643', createdAt: null },
            { name: 'Pedágio', icon: 'ticket', colorToken: 'green', isDefault: true, id: 'f7fef27e-1e2c-4014-b96d-92110694f726', createdAt: null },
            { name: 'Outros', icon: 'dollar-sign', colorToken: 'orange', isDefault: true, id: '5c4a3410-8742-4df0-a26f-7edee0d2b6bc', createdAt: null }
        ];
    }

    if (legacyTypes.length > 0) {
        console.log(`Found ${legacyTypes.length} legacy cost types (DB or Hardcoded). Migrating...`);
        let count = 0;
        for (const legacy of legacyTypes) {
            // Check if exists
            const existing = await db.select().from(costTypes).where(eq(costTypes.name, legacy.name!)).limit(1);
            if (existing.length === 0) {
                // Map icons from legacy names (if needed) or use direct
                // Legacy icons: Zap, Car, Ticket, DollarSign
                // Lucide icons: zap, car, ticket, dollar-sign
                let icon = legacy.icon?.toLowerCase() || 'dollar-sign';
                if (icon === 'zap') icon = 'zap'; // ok
                if (icon === 'car') icon = 'car'; // ok
                if (icon === 'ticket') icon = 'ticket'; // ok
                if (icon === 'dollarsign') icon = 'dollar-sign';

                await db.insert(costTypes).values({
                    name: legacy.name!,
                    category: 'Variável',
                    description: 'Importado do Legado',
                    icon: icon,
                    color: legacy.colorToken || 'gray',
                    isActive: true
                });
                count++;
            }
        }
        return { migrated: true, count };
    }

    // Fallback if no legacy data found
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
    return { migrated: false, count: 5 };
}
