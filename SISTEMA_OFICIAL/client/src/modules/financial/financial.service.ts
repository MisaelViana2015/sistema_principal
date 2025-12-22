
import { api } from "../../lib/api";

export interface Expense {
    id: string;
    valor: string; // Changed to string because backend sends numeric/decimal as string usually, or number. Let's align with types.
    data: string;
    notes: string;
    tipo: string;
    categoria: string;
    tipoCor: string;
    shiftId?: string;
    motoristaNome?: string;
}

export const financialService = {
    /**
     * Busca todas as despesas (pode filtrar por turno)
     */
    getExpenses: async (shiftId?: string) => {
        const params = shiftId ? { shiftId } : {};
        const { data } = await api.get<Expense[]>("/financial/expenses", { params });
        return data;
    },

    /**
     * Busca tipos de custo
     */
    getCostTypes: async () => {
        const { data } = await api.get("/financial/cost-types");
        return data;
    },

    /**
     * Cria uma nova despesa
     */
    createExpense: async (payload: any) => {
        const { data } = await api.post("/financial/expenses", payload);
        return data;
    },

    /**
     * Deleta uma despesa
     */
    deleteExpense: async (id: string) => {
        const { data } = await api.delete(`/financial/expenses/${id}`);
        return data;
    },

    /**
     * Custos Fixos
     */
    getFixedCosts: async () => {
        const { data } = await api.get("/financial/fixed-costs");
        return data;
    },

    createFixedCost: async (payload: any) => {
        const { data } = await api.post("/financial/fixed-costs", payload);
        return data;
    },

    updateFixedCost: async (id: string, payload: any) => {
        const { data } = await api.put(`/financial/fixed-costs/${id}`, payload);
        return data;
    },

    deleteFixedCost: async (id: string) => {
        const { data } = await api.delete(`/financial/fixed-costs/${id}`);
        return data;
    }
};
