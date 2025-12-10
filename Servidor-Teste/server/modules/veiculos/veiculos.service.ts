
import { eq } from "drizzle-orm";
import { db } from "../../core/db/connection.js";
import { vehicles } from "../../../shared/schema.js";

export const veiculosService = {
    async getAllVeiculos() {
        return await db.select().from(vehicles);
    }
};
