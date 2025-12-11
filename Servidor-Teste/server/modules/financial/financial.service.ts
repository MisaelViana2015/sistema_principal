
import * as repository from "./financial.repository.js";

export async function getAllExpenses() {
    return await repository.findAllExpenses();
}

export async function getAllCostTypes() {
    return await repository.findAllCostTypes();
}

export async function getAllFixedCosts() {
    return await repository.findAllFixedCosts();
}
