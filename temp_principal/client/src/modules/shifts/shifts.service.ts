
import { api } from "../../lib/api";
import { Shift } from "../../../../shared/schema";

export interface ShiftsFilters {
    driverId?: string;
    vehicleId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const shiftsService = {
    async getAll(filters?: ShiftsFilters) {
        const params = new URLSearchParams();
        if (filters?.driverId && filters.driverId !== 'todos') params.append('driverId', filters.driverId);
        if (filters?.vehicleId && filters.vehicleId !== 'todos') params.append('vehicleId', filters.vehicleId);
        if (filters?.status && filters.status !== 'todos') params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.page) params.append('page', String(filters.page));

        const response = await api.get<PaginatedResponse<Shift>>(`/shifts?${params.toString()}`);
        return response.data;
    },

    async getCurrentShift(driverId?: string) {
        const query = driverId ? `?driverId=${driverId}` : '';
        const response = await api.get<Shift | null>(`/shifts/current${query}`);
        return response.data;
    },

    async startShift(vehicleId: string, kmInicial: number, driverId?: string) {
        const response = await api.post<Shift>(`/shifts`, { vehicleId, kmInicial, driverId });
        return response.data;
    },

    async finishShift(shiftId: string, kmFinal: number) {
        const response = await api.post<Shift>(`/shifts/${shiftId}/finish`, { kmFinal });
        return response.data;
    },

    async delete(shiftId: string) {
        await api.delete(`/shifts/${shiftId}`);
    }
};
