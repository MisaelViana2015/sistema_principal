
import axios from "axios";

// Interface para um pneu (deve corresponder ao backend)
export interface Tire {
    id: string;
    vehicleId: string | null;
    position: string;
    brand: string;
    model: string;
    status: string;
    installDate: string;
    installKm: number;
    createdAt?: string;
    updatedAt?: string;
}

// Interface para criar pneu (inputs do form)
export interface CreateTireDTO {
    vehicleId: string;
    position: string;
    brand: string;
    model: string;
    status: string;
    installDate: Date;
    installKm: number;
}

const API_URL = "/api/tires";

class TiresService {
    async create(data: CreateTireDTO): Promise<Tire> {
        const response = await axios.post(API_URL, data);
        return response.data;
    }

    async getAll(): Promise<Tire[]> {
        const response = await axios.get(API_URL);
        return response.data;
    }

    async delete(id: string): Promise<void> {
        await axios.delete(`${API_URL}/${id}`);
    }
}

export const tiresService = new TiresService();
