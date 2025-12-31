
import { maintenanceRepository } from "./maintenance.repository.js";
import { vehiclesRepository } from "../vehicles/vehicles.repository.js";

export const maintenanceService = {

    // Inicializar sistema (garantir que todos veículos tenham configs)
    async ensureConfigsForFleet() {
        // @ts-ignore
        const vehicles = await vehiclesRepository.findAll();
        const configs = await maintenanceRepository.getConfigs();

        for (const v of vehicles) {
            for (const c of configs) {
                // Se kmInicial > 0 e currentKm é 0, assume current = inicial
                const vehicle = v as any;
                const km = vehicle.currentKm || vehicle.kmInicial || 0;
                await maintenanceRepository.initMaintenance(v.id, c.id, c.intervalKm, km);
            }
        }
    },

    // Obter Dashboard da Frota
    async getFleetDashboard() {
        await this.ensureConfigsForFleet(); // Garante consistência

        // @ts-ignore
        const vehicles = await vehiclesRepository.findAll();
        const dashboard = [];

        for (const v of vehicles) {
            const vehicle = v as any;
            // Pega manutenções deste veículo
            const maintenances = await maintenanceRepository.getMaintenancesByVehicle(v.id);

            // Calcula status geral do veículo (pior status das manutenções)
            let generalStatus = 'ok';
            if (maintenances.some(m => m.status === 'overdue')) generalStatus = 'overdue';
            else if (maintenances.some(m => m.status === 'warning')) generalStatus = 'warning';

            dashboard.push({
                vehicle: {
                    id: v.id,
                    plate: v.plate,
                    model: v.modelo, // Note: Schema uses 'modelo', repo might map it. Let's assume repo returns 'modelo' per schema.
                    currentKm: vehicle.currentKm || vehicle.kmInicial || 0,
                    imageUrl: vehicle.imageUrl
                },
                status: generalStatus,
                maintenances // Lista detalhada
            });
        }

        return dashboard.sort((a, b) => {
            // Ordenar por urgência: Overdue > Warning > Ok
            const score = (s: string) => s === 'overdue' ? 0 : s === 'warning' ? 1 : 2;
            return score(a.status) - score(b.status);
        });
    },

    // Contar alertas ativos (overdue + warning)
    async getAlertCount() {
        // Usa o dashboard já calculado para não duplicar lógica
        const dashboard = await this.getFleetDashboard();

        const overdueCount = dashboard.filter(d => d.status === 'overdue').length;
        const warningCount = dashboard.filter(d => d.status === 'warning').length;

        return {
            total: overdueCount + warningCount,
            overdue: overdueCount,
            warning: warningCount
        };
    },

    // Registrar que uma manutenção foi feita
    async performMaintenance(vehicleId: string, configId: string, currentKm: number, date: Date) {
        // 1. Busca config para saber intervalo
        const configs = await maintenanceRepository.getConfigs();
        const config = configs.find(c => c.id === configId);

        if (!config) throw new Error("Configuração de manutenção não encontrada");

        // 2. Registra e Reseta
        await maintenanceRepository.registerMaintenance(vehicleId, configId, currentKm, config.intervalKm);

        // 3. Atualiza KM do veículo também (se o informado for maior)
        const vehicle = await vehiclesRepository.findById(vehicleId);
        // @ts-ignore
        if (vehicle && currentKm > (vehicle.currentKm || 0)) {
            await vehiclesRepository.update(vehicleId, { currentKm });
        }

        // 4. Re-check status
        await this.checkStatus(vehicleId, currentKm);
    },

    // Verificar e atualizar status (chamado pelo finishShift)
    async checkStatus(vehicleId: string, currentKm: number) {
        await maintenanceRepository.updateStatus(vehicleId, currentKm);
    },

    async fixDbData() {
        return await maintenanceRepository.fixNamesAndGetDiagnostic();
    }
};
