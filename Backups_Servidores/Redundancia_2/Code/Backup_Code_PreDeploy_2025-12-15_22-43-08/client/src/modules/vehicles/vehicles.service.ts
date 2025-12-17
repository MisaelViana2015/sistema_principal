import { api } from "../../lib/api";
import { Vehicle } from "../../../../shared/schema";

export const vehiclesService = {
    async getAll() {
        // The API returns an array directly? or { success: true, data: ... }?
        // Looking at controller: res.json(vehicles);
        // looking at lib/api: api is axios instance.
        const response = await api.get<Vehicle[]>("/vehicles");
        return response.data;
    }
};
