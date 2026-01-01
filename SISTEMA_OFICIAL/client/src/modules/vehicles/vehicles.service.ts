import { api } from "../../lib/api";
import { Vehicle } from "../../../../shared/schema";

export const vehiclesService = {
    async getAll() {
        const response = await api.get<Vehicle[]>("/vehicles");
        return response.data;
    },

    async getAllWithStatus() {
        const response = await api.get<(Vehicle & { currentShiftId: string | null })[]>("/vehicles/with-status");
        return response.data;
    },

    async create(data: Partial<Vehicle>) {
        const response = await api.post<Vehicle>("/vehicles", data);
        return response.data;
    },

    async update(id: string, data: Partial<Vehicle>) {
        const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        await api.delete(`/vehicles/${id}`);
    }
};
