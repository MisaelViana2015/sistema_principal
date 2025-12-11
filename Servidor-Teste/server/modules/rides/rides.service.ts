
import * as ridesRepository from "./rides.repository.js";

export async function getAllRides() {
    return await ridesRepository.findAllRides();
}
