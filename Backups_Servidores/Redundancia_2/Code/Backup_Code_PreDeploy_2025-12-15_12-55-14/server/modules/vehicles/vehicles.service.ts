
import { eq } from "drizzle-orm";
import { db } from "../../core/db/connection.js";
import { vehicles } from "../../../shared/schema.js";

export const vehiclesService = {
    async getAllVehicles() {
        return await db.select().from(vehicles);
    }
};
