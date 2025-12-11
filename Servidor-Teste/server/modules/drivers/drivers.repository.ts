
import { db } from "../../core/db/connection.js";
import { drivers } from "../../../shared/schema.js";
import { desc } from "drizzle-orm";

export async function findAllDrivers() {
    return await db.select().from(drivers).orderBy(desc(drivers.nome)); // Assuming 'nome' exists, check schema if not
}
