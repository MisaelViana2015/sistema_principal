
import * as tiresRepository from "./tires.repository.js";
import { InsertTire } from "../../../shared/schema.js";

export async function create(data: InsertTire) {
    return await tiresRepository.createTire(data);
}

export async function getAll() {
    return await tiresRepository.findAllTires();
}

export async function remove(id: string) {
    return await tiresRepository.deleteTire(id);
}
