
import { db } from "../../core/db/connection.js";
import { drivers, NewDriver } from "../../../shared/schema.js";
import { desc, eq } from "drizzle-orm";

export async function findAllDrivers() {
    return await db.select().from(drivers).orderBy(desc(drivers.nome));
}

export async function findDriverById(id: string) {
    const results = await db.select().from(drivers).where(eq(drivers.id, id)).limit(1);
    return results[0];
}

export async function findDriverByEmail(email: string) {
    const results = await db.select().from(drivers).where(eq(drivers.email, email)).limit(1);
    return results[0];
}

export async function createDriver(data: NewDriver) {
    const results = await db.insert(drivers).values(data).returning();
    return results[0];
}

export async function updateDriver(id: string, data: Partial<NewDriver>) {
    const results = await db.update(drivers).set(data).where(eq(drivers.id, id)).returning();
    return results[0];
}

export async function deleteDriver(id: string) {
    await db.delete(drivers).where(eq(drivers.id, id));
}
