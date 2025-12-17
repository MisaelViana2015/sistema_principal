
import * as shiftsRepository from "./shifts.repository.js";

export async function getAllShifts(page: number, limit: number, filters: any) {
    return await shiftsRepository.findAllShifts(page, limit, filters);
}

export async function startShift(driverId: string, vehicleId: string, kmInicial: number) {
    // Check if driver already has open shift
    const openShift = await shiftsRepository.findOpenShiftByDriver(driverId);
    if (openShift) {
        throw new Error("Motorista já possui um turno aberto.");
    }

    const newShift = await shiftsRepository.createShift({
        driverId,
        vehicleId,
        kmInicial,
        inicio: new Date(),
        status: 'em_andamento'
    });

    return newShift;
}

export async function finishShift(shiftId: string, kmFinal: number) {
    const shift = await shiftsRepository.findShiftById(shiftId);
    if (!shift) throw new Error("Turno não encontrado");
    if (shift.status !== 'em_andamento' && shift.status !== 'aberto') throw new Error("Turno já finalizado");

    const updatedShift = await shiftsRepository.updateShift(shiftId, {
        kmFinal,
        fim: new Date(),
        status: 'finalizado'
    });

    return updatedShift;
}

export async function getOpenShift(driverId: string) {
    return await shiftsRepository.findOpenShiftByDriver(driverId);
}
