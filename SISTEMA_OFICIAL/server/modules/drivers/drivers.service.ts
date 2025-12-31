
import * as driversRepository from "./drivers.repository.js";
import { NewDriver } from "../../../shared/schema.js";
import bcrypt from "bcryptjs";

export async function getAllDrivers() {
    return await driversRepository.findAllDrivers();
}

export async function createDriver(data: NewDriver) {
    const existing = await driversRepository.findDriverByEmail(data.email);
    if (existing) {
        throw new Error("Email já cadastrado.");
    }

    const hashedPassword = await bcrypt.hash(data.senha, 10);

    return await driversRepository.createDriver({
        ...data,
        senha: hashedPassword
    });
}

export async function updateDriver(id: string, data: Partial<NewDriver>) {
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

    return await driversRepository.updateDriver(id, updateData);
}

export async function deleteDriver(id: string) {
    return await driversRepository.deleteDriver(id);
}

export async function resetDriverPassword(driverId: string): Promise<{ tempPassword: string; expiresAt: Date }> {
    // 1. Gerar senha temporária: "RV-" + 4 dígitos
    const tempPassword = `RV-${Math.floor(1000 + Math.random() * 9000)}`;

    // 2. Hash da senha (bcrypt)
    const tempHash = await bcrypt.hash(tempPassword, 10);

    // 3. Expira em 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Salvar no banco
    await driversRepository.updateDriver(driverId, {
        temp_password_hash: tempHash,
        temp_password_expires_at: expiresAt,
        must_reset_password: true
    } as any);

    return { tempPassword, expiresAt };
}
