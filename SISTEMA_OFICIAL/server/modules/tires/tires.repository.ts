
import { db } from "../../core/db/connection.js";
import { tires, InsertTire } from "../../../shared/schema.js";
import { eq, desc } from "drizzle-orm";

export async function createTire(data: InsertTire) {
    const result = await db.insert(tires).values(data).returning();
    return result[0];
}

export async function findAllTires() {
    return await db.select().from(tires).orderBy(desc(tires.installDate));
}

export async function findTireById(id: string) {
    const result = await db.select().from(tires).where(eq(tires.id, id));
    return result[0];
}

export async function deleteTire(id: string) {
    await db.delete(tires).where(eq(tires.id, id));
    return true;
}
