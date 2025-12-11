import { db } from "../../core/db/connection.js";
import { shifts, drivers, vehicles } from "@shared/schema.js";
import { eq, desc } from "drizzle-orm";

export async function findAllShifts() {
    // Join with driver and vehicle tables to fetch names and plates
    const results = await db
        .select({
            id: shifts.id,
            motorista: drivers.nome,
            veiculo: vehicles.plate,
            inicio: shifts.inicio,
            fim: shifts.fim,
            status: shifts.status,
            kmRodado: shifts.kmFinal, // This logic might need adjustment if kmRodado is diff
            kmInicial: shifts.kmInicial,
            receita: shifts.totalBruto,
            // Add other fields as needed for the UI
        })
        .from(shifts)
        .leftJoin(drivers, eq(shifts.driverId, drivers.id))
        .leftJoin(vehicles, eq(shifts.vehicleId, vehicles.id))
        .orderBy(desc(shifts.inicio));

    // Calculate kmRodado if needed (kmFinal - kmInicial)
    return results.map((shift: any) => ({
        ...shift,
        kmRodado: shift.kmRodado && shift.kmInicial ? (shift.kmRodado - shift.kmInicial) : 0
    }));
}
