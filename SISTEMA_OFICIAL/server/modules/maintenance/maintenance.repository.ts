
import { db } from "../../core/db/connection.js";
import { vehicleMaintenances, maintenanceConfigs, vehicles } from "../../../shared/schema.js";
import { eq, and, sql } from "drizzle-orm";

export const maintenanceRepository = {

    // Buscar configs ativas
    async getConfigs() {
        return await db.select().from(maintenanceConfigs).where(eq(maintenanceConfigs.isActive, true));
    },

    // Buscar status de manutenção por veículo
    async getVehicleStatus(vehicleId: string) {
        return await db.query.vehicleMaintenances.findMany({
            where: eq(vehicleMaintenances.vehicleId, vehicleId),
            with: {
                config: true
            }
        });
    },

    // Buscar DASHBOARD (Status da frota)
    async getFleetStatus() {
        // Retorna todos os veículos com suas manutenções
        return await db.query.vehicles.findMany({
            where: eq(vehicles.isActive, true),
            columns: {
                id: true,
                plate: true,
                modelo: true,
                currentKm: true,
                imageUrl: true
            },
            with: {
                // @ts-ignore - Drizzle relation might be missing in schema file but we will add it
                // Assuming we add relations later. For now, let's fetch maintenance manually in service if relation is missing
            }
        });
    },

    // Buscar manutenções de um veículo
    async getMaintenancesByVehicle(vehicleId: string) {
        return await db.select({
            id: vehicleMaintenances.id,
            configId: vehicleMaintenances.configId,
            configName: maintenanceConfigs.name,
            interval: maintenanceConfigs.intervalKm,
            lastKm: vehicleMaintenances.lastPerformedKm,
            nextKm: vehicleMaintenances.nextDueKm,
            status: vehicleMaintenances.status
        })
            .from(vehicleMaintenances)
            .innerJoin(maintenanceConfigs, eq(vehicleMaintenances.configId, maintenanceConfigs.id))
            .where(eq(vehicleMaintenances.vehicleId, vehicleId));
    },

    // Inicializar manutenção para um veículo (se não existir)
    async initMaintenance(vehicleId: string, configId: string, interval: number, currentKm: number) {
        // Verifica se já existe
        const existing = await db.select().from(vehicleMaintenances)
            .where(and(
                eq(vehicleMaintenances.vehicleId, vehicleId),
                eq(vehicleMaintenances.configId, configId)
            ))
            .limit(1);

        if (existing.length > 0) return;

        // Cria registro inicial
        await db.insert(vehicleMaintenances).values({
            vehicleId,
            configId,
            lastPerformedKm: currentKm,
            nextDueKm: currentKm + interval,
            status: 'ok',
            lastPerformedAt: new Date()
        });
    },

    // Registrar VISTORIA REALIZADA (Resetar contador)
    async registerMaintenance(vehicleId: string, configId: string, currentKm: number, interval: number) {
        await db.update(vehicleMaintenances)
            .set({
                lastPerformedKm: currentKm,
                lastPerformedAt: new Date(),
                nextDueKm: currentKm + interval,
                status: 'ok'
            })
            .where(and(
                eq(vehicleMaintenances.vehicleId, vehicleId),
                eq(vehicleMaintenances.configId, configId)
            ));
    },

    // Atualizar STATUS baseado na KM atual
    async updateStatus(vehicleId: string, currentKm: number) {
        // Define status = 'overdue' se currentKm >= nextDueKm
        // Define status = 'warning' se currentKm >= nextDueKm - 1000

        await db.execute(sql`
            UPDATE vehicle_maintenances
            SET status = CASE
                WHEN ${currentKm} >= next_due_km THEN 'overdue'
                WHEN ${currentKm} >= next_due_km - 1000 THEN 'warning'
                ELSE 'ok'
            END
            WHERE vehicle_id = ${vehicleId}
        `);
    },

    async fixNamesAndGetDiagnostic() {
        // 1. Corrigir nomes
        await db.execute(sql`UPDATE maintenance_configs SET name = 'Revisão Periódica' WHERE name ILIKE '%Revisão%'`);
        await db.execute(sql`UPDATE maintenance_configs SET interval_km = 5000 WHERE name ILIKE '%Pneu%' OR name ILIKE '%Rodízio%'`);

        // 3. Recalcular next_due
        await db.execute(sql`
            UPDATE vehicle_maintenances vm
            SET next_due_km = vm.last_performed_km + mc.interval_km
            FROM maintenance_configs mc
            WHERE vm.config_id = mc.id
        `);

        // 2. Retornar diagnóstico TQU0H17
        const result = await db.execute(sql`
            SELECT v.plate, v.current_km, mc.name, vm.next_due_km, vm.status, vm.last_performed_km
            FROM vehicles v
            JOIN vehicle_maintenances vm ON v.id = vm.vehicle_id
            JOIN maintenance_configs mc ON vm.config_id = mc.id
            WHERE v.plate LIKE '%TQU0H17%'
        `);
        return result.rows;
    }
};
