
import { NewVehicle } from "../../../shared/schema.js";
import { vehiclesRepository } from "./vehicles.repository.js";
import { auditService, AuditContext } from "../../core/audit/audit.service.js";

/**
 * SERVICE - VEHICLES
 *
 * REGRA: Service contém TODA a lógica de negócio
 * Não acessa req/res diretamente
 * Não faz queries diretas (usa repository)
 */

export const vehiclesService = {
    async getAllVehicles() {
        return await vehiclesRepository.findAll();
    },

    async createVehicle(data: NewVehicle, context?: AuditContext) {
        if (context) {
            return await auditService.withAudit({
                action: 'CREATE_VEHICLE',
                entity: 'vehicles',
                entityId: 'new',
                operation: 'INSERT',
                context,
                execute: () => vehiclesRepository.create(data),
                fetchAfter: (result) => vehiclesRepository.findById(result!.id)
            });
        }
        return await vehiclesRepository.create(data);
    },

    async updateVehicle(id: string, data: Partial<NewVehicle>, context?: AuditContext) {
        // Regra de Negócio: Validação de KM
        if (data.kmInicial !== undefined) {
            const currentVehicle = await vehiclesRepository.findById(id);

            if (!currentVehicle) {
                throw new Error(`Veículo não encontrado: ${id}`);
            }

            // TRAVA REMOVIDA A PEDIDO (26/12): Admin pode reduzir KM para corrigir erros.
            // if (Number(data.kmInicial) < Number(currentVehicle.kmInicial)) {
            //    throw new Error(`A quilometragem não pode ser reduzida. Atual: ${currentVehicle.kmInicial}, Tentativa: ${data.kmInicial}`);
            // }
        }

        if (context) {
            return await auditService.withAudit({
                action: 'UPDATE_VEHICLE',
                entity: 'vehicles',
                entityId: id,
                operation: 'UPDATE',
                context,
                fetchBefore: () => vehiclesRepository.findById(id),
                execute: () => vehiclesRepository.update(id, data),
                fetchAfter: () => vehiclesRepository.findById(id)
            });
        }

        return await vehiclesRepository.update(id, data);
    },

    async deleteVehicle(id: string, context?: AuditContext) {
        if (context) {
            return await auditService.withAudit({
                action: 'DELETE_VEHICLE',
                entity: 'vehicles',
                entityId: id,
                operation: 'DELETE',
                context,
                fetchBefore: () => vehiclesRepository.findById(id),
                execute: () => vehiclesRepository.delete(id)
            });
        }
        return await vehiclesRepository.delete(id);
    }
};
