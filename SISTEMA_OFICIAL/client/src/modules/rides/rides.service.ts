import { api } from "../../lib/api";
import { Ride } from "../../../../shared/schema";

export interface RidesFilters {
    driverId?: string;
    vehicleId?: string;
    shiftId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    };
}

export interface RideWithDetails extends Ride {
    driverName?: string;
    driverId?: string;
    vehiclePlate?: string;
}

export const ridesService = {
    async getAll(filters?: RidesFilters) {
        const params = new URLSearchParams();
        if (filters?.driverId && filters.driverId !== 'todos') params.append('driverId', filters.driverId);
        if (filters?.vehicleId && filters.vehicleId !== 'todos') params.append('vehicleId', filters.vehicleId);
        if (filters?.shiftId) params.append('shiftId', filters.shiftId);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.page) params.append('page', String(filters.page));

        const response = await api.get<PaginatedResponse<RideWithDetails>>(`/rides?${params.toString()}`);
        return response.data;
    },

    async update(id: string, data: Partial<Ride>) {
        const response = await api.put<Ride>(`/rides/${id}`, data);
        return response.data;
    },

    async delete(id: string) {
        await api.delete(`/rides/${id}`);
    }
};
