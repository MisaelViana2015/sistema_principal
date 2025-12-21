
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
        if (data.kmInicial !== undefined) {
            const currentVehicle = await db.query.vehicles.findFirst({
                where: eq(vehicles.id, id)
            });

            if (currentVehicle && Number(data.kmInicial) < Number(currentVehicle.kmInicial)) {
                throw new Error(`A quilometragem não pode ser reduzida. Atual: ${currentVehicle.kmInicial}, Tentativa: ${data.kmInicial}`);
            }
        }

        const [updatedVehicle] = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
        return updatedVehicle;
    },

    async deleteVehicle(id: string) {
        return await db.delete(vehicles).where(eq(vehicles.id, id));
    }
};
