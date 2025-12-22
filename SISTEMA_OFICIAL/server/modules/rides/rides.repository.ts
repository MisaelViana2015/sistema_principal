
import { db } from "../../core/db/connection.js";
import { rides, shifts, drivers, vehicles } from "../../../shared/schema.js";
import { eq, desc, and, sql, count } from "drizzle-orm";

export async function getWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: {
        driverId?: string;
        vehicleId?: string;
        shiftId?: string;
        startDate?: string;
        endDate?: string;
    }
) {
    const offset = (page - 1) * limit;

    // Base conditions
    const conditions = [];
    if (filters?.driverId) conditions.push(eq(shifts.driverId, filters.driverId));
    if (filters?.vehicleId) conditions.push(eq(shifts.vehicleId, filters.vehicleId)); // Rides linked via shift
    if (filters?.shiftId) conditions.push(eq(rides.shiftId, filters.shiftId));
    if (filters?.startDate) conditions.push(sql`${rides.hora} >= ${filters.startDate}`);
    if (filters?.endDate) conditions.push(sql`${rides.hora} <= ${filters.endDate}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    // Get total count and sums for pagination/totals
    const totalResult = await db
        .select({
            count: count(),
            totalApp: sql<number>`COALESCE(SUM(CASE WHEN UPPER(TRIM(${rides.tipo})) = 'APP' OR UPPER(TRIM(${rides.tipo})) = 'APLICATIVO' THEN ${rides.valor} ELSE 0 END), 0)`,
            totalParticular: sql<number>`COALESCE(SUM(CASE WHEN UPPER(TRIM(${rides.tipo})) != 'APP' AND UPPER(TRIM(${rides.tipo})) != 'APLICATIVO' THEN ${rides.valor} ELSE 0 END), 0)`
        })
        .from(rides)
        .leftJoin(shifts, eq(rides.shiftId, shifts.id))
        .where(whereClause);

    const totalItems = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Get paginated data
    const data = await db
        .select({
            id: rides.id,
            hora: rides.hora,
            valor: rides.valor,
            tipo: rides.tipo,
            shiftId: rides.shiftId,
            driverName: drivers.nome,
            driverId: drivers.id,
            vehiclePlate: vehicles.plate,
        })
        .from(rides)
        .leftJoin(shifts, eq(rides.shiftId, shifts.id))
        .leftJoin(drivers, eq(shifts.driverId, drivers.id))
        .leftJoin(vehicles, eq(shifts.vehicleId, vehicles.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(rides.hora));

    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
        },
        totals: {
            totalApp: Number(totalResult[0]?.totalApp || 0),
            totalPrivate: Number(totalResult[0]?.totalParticular || 0)
        }
    };
}

export async function create(data: typeof rides.$inferInsert) {
    const [newRide] = await db.insert(rides).values(data).returning();
    return newRide;
}

export async function getById(id: string) {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride;
}

export async function update(id: string, data: Partial<typeof rides.$inferInsert>) {
    const [updated] = await db
        .update(rides)
        .set(data)
        .where(eq(rides.id, id))
        .returning();
    return updated;
}

export async function deleteRide(id: string) {
    const [deleted] = await db
        .delete(rides)
        .where(eq(rides.id, id))
        .returning();
    return deleted;
}
