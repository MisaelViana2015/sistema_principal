
import { db } from "../../core/db/connection.js";
import { rides, shifts, drivers } from "../../../shared/schema.js";
import { eq, desc } from "drizzle-orm";

export async function findAllRides() {
    return await db
        .select({
            id: rides.id,
            hora: rides.hora,
            valor: rides.valor,
            tipo: rides.tipo,
            shiftId: rides.shiftId,
            motorista: drivers.nome,
        })
        .from(rides)
        .leftJoin(shifts, eq(rides.shiftId, shifts.id))
        .leftJoin(drivers, eq(shifts.driverId, drivers.id))
        .orderBy(desc(rides.hora));
}
