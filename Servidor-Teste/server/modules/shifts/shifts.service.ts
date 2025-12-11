import * as shiftsRepository from "./shifts.repository.js";

export async function getAllShifts() {
    try {
        const shifts = await shiftsRepository.findAllShifts();
        return shifts;
    } catch (error) {
        console.error("Error in getAllShifts service:", error);
        throw error;
    }
}
