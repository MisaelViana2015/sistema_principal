
import { NewVehicle } from "../../../shared/schema.js";
import { vehiclesRepository } from "./vehicles.repository.js";

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

    async createVehicle(data: NewVehicle) {
        return await vehiclesRepository.create(data);
    },

    async updateVehicle(id: string, data: Partial<NewVehicle>) {
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

        return await vehiclesRepository.update(id, data);
    },

    async deleteVehicle(id: string) {
        return await vehiclesRepository.delete(id);
    }
};
