
import { eq } from "drizzle-orm";
import { db } from "../../core/db/connection.js";
import { vehicles, NewVehicle } from "../../../shared/schema.js";

export const vehiclesService = {
    async getAllVehicles() {
        return await db.select().from(vehicles);
    },

    async createVehicle(data: NewVehicle) {
        const [newVehicle] = await db.insert(vehicles).values(data).returning();
        return newVehicle;
    },

    async updateVehicle(id: string, data: Partial<NewVehicle>) {
        const [updatedVehicle] = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
        return updatedVehicle;
    },

    async deleteVehicle(id: string) {
        return await db.delete(vehicles).where(eq(vehicles.id, id));
    }
};
