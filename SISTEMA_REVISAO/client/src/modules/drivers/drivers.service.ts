
import { api } from "../../lib/api";
import { Driver } from "../../../../shared/schema";

export const driversService = {
    async getAll() {
        const response = await api.get<Driver[]>("/drivers");
        return response.data;
    },
    async create(data: Omit<Driver, "id">) {
        const response = await api.post<Driver>("/drivers", data);
        return response.data;
    },
    async update(id: string, data: Partial<Driver>) {
        const response = await api.put<Driver>(`/drivers/${id}`, data);
        return response.data;
    },
    async delete(id: string) {
        await api.delete(`/drivers/${id}`);
    },
    async resetPassword(id: string): Promise<{ temp_password: string; expires_at: string; message: string }> {
        const response = await api.post(`/drivers/${id}/reset-password`);
        return response.data;
    }
};
