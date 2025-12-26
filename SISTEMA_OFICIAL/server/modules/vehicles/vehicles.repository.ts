
import { db } from "../../core/db/connection.js";
import { vehicles, drivers, NewVehicle } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";

/**
 * REPOSITORY - VEHICLES
 * 
 * REGRA: Repository só faz queries no banco
 * Não contém lógica de negócio
 * Não trata erros de validação
 */

export const vehiclesRepository = {
    async findAll() {
        return await db
            .select({
                id: vehicles.id,
                plate: vehicles.plate,
                modelo: vehicles.modelo, // Note: Schema uses 'modelo'
                motoristaPadraoId: vehicles.motoristaPadraoId,
                isActive: vehicles.isActive,
                currentShiftId: vehicles.currentShiftId,
                kmInicial: vehicles.kmInicial,
                color: vehicles.color,
                imageUrl: vehicles.imageUrl,
                status: vehicles.status,
                driverName: drivers.nome
            })
            .from(vehicles)
            .leftJoin(drivers, eq(vehicles.motoristaPadraoId, drivers.id));
    },

    async findById(id: string) {
        return await db.query.vehicles.findFirst({
            where: eq(vehicles.id, id)
        });
    },

    async create(data: NewVehicle) {
        const [newVehicle] = await db.insert(vehicles).values(data).returning();
        return newVehicle;
    },

    async update(id: string, data: Partial<NewVehicle>) {
        const [updatedVehicle] = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
        return updatedVehicle;
    },

    async delete(id: string) {
        return await db.delete(vehicles).where(eq(vehicles.id, id));
    }
};
