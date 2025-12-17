
import { api } from "../../lib/api";

export interface Expense {
    id: string;
    valor: string;
    data: string;
    notes: string;
    tipo: string;
    categoria: string;
    tipoCor: string;
    motorista: string;
    shiftId: string;
    veiculo?: string;
    modelo?: string;
}

export interface LegacyMaintenance {
    id: string;
    veiculoId: string;
    veiculoPlate?: string;
    veiculoModelo?: string;
    tipo: string;
    notes: string;
    data: string;
    valor: string;
    km?: number;
}

export const financialService = {
    async getAllExpenses() {
        const response = await api.get<Expense[]>("/financial/expenses");
        return response.data;
    },
    async getAllLegacyMaintenances() {
        const response = await api.get<LegacyMaintenance[]>("/financial/legacy-maintenances");
        return response.data;
    }
};
