
import * as driversRepository from "./drivers.repository.js";
import { NewDriver } from "../../../shared/schema.js";
import bcrypt from "bcryptjs";
import { auditService, AuditContext } from "../../core/audit/audit.service.js";

export async function getAllDrivers() {
    return await driversRepository.findAllDrivers();
}



export async function createDriver(data: NewDriver, context?: AuditContext) {
    const existing = await driversRepository.findDriverByEmail(data.email);
    if (existing) {
        throw new Error("Email já cadastrado.");
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);
    const driverToCreate = { ...data, senha: hashedPassword };

    if (context) {
        return await auditService.withAudit({
            action: 'CREATE_DRIVER',
            entity: 'drivers',
            entityId: 'new', // will be updated by payload usually, but for create usually we rely on return
            operation: 'INSERT',
            context,
            execute: () => driversRepository.createDriver(driverToCreate),
            fetchAfter: (result) => driversRepository.findDriverById(result!.id)
        });
    }

    return await driversRepository.createDriver(driverToCreate);
}

export async function updateDriver(id: string, data: Partial<NewDriver>, context?: AuditContext) {
    if (data.email) {
        const existing = await driversRepository.findDriverByEmail(data.email);
        if (existing && existing.id !== id) {
            throw new Error("Email já está em uso por outro motorista.");
        }
    }

    let updateData = { ...data };
    if (data.senha && data.senha.trim().length > 0) {
        updateData.senha = await bcrypt.hash(data.senha, 10);
    } else {
        delete updateData.senha;
    }

    if (context) {
        return await auditService.withAudit({
            action: 'UPDATE_DRIVER',
            entity: 'drivers',
            entityId: id,
            operation: 'UPDATE',
            context,
            fetchBefore: () => driversRepository.findDriverById(id),
            execute: () => driversRepository.updateDriver(id, updateData),
            fetchAfter: () => driversRepository.findDriverById(id)
        });
    }

    return await driversRepository.updateDriver(id, updateData);
}

export async function deleteDriver(id: string, context?: AuditContext) {
    if (context) {
        return await auditService.withAudit({
            action: 'DELETE_DRIVER',
            entity: 'drivers',
            entityId: id,
            operation: 'DELETE',
            context,
            fetchBefore: () => driversRepository.findDriverById(id),
            execute: () => driversRepository.deleteDriver(id)
        });
    }
    return await driversRepository.deleteDriver(id);
}

export async function resetDriverPassword(driverId: string, context?: AuditContext): Promise<{ tempPassword: string; expiresAt: Date }> {
    // 1. Gerar senha temporária
    const tempPassword = `RV-${Math.floor(10000 + Math.random() * 90000)}`;

    // 2. Hash da senha
    const tempHash = await bcrypt.hash(tempPassword, 10);

    // 3. Expira em 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const updateFn = () => driversRepository.updateDriver(driverId, {
        temp_password_hash: tempHash,
        temp_password_expires_at: expiresAt,
        must_reset_password: true
    } as any);

    if (context) {
        await auditService.withAudit({
            action: 'RESET_DRIVER_PASSWORD',
            entity: 'drivers',
            entityId: driverId,
            operation: 'UPDATE',
            context,
            fetchBefore: () => driversRepository.findDriverById(driverId),
            execute: updateFn,
            fetchAfter: () => driversRepository.findDriverById(driverId)
        });
    } else {
        await updateFn();
    }

    return { tempPassword, expiresAt };
}
