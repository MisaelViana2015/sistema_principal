
import * as driversRepository from "./drivers.repository.js";

export async function getAllDrivers() {
    return await driversRepository.findAllDrivers();
}
