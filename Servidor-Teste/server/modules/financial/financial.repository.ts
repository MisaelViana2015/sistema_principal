
import { db } from "../../core/db/connection.js";
import { expenses, costTypes, fixedCosts, drivers } from "../../../shared/schema.js";
import { eq, desc } from "drizzle-orm";

export async function findAllExpenses() {
    return await db
        .select({
            id: expenses.id,
            valor: expenses.value,
            data: expenses.date,
            notes: expenses.notes,
            tipo: costTypes.name,
            tipoCor: costTypes.description,
            motorista: drivers.nome,
        })
        .from(expenses)
        .leftJoin(costTypes, eq(expenses.costTypeId, costTypes.id))
        .leftJoin(drivers, eq(expenses.driverId, drivers.id))
        .orderBy(desc(expenses.date));
}

export async function findAllCostTypes() {
    return await db.select().from(costTypes);
}

export async function findAllFixedCosts() {
    return await db.select().from(fixedCosts);
}
