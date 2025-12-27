
import { db } from "../modules/core/db/connection.js";
import { shifts, drivers, vehicles } from "../modules/shared/schema.js";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Inserindo turnos de teste...");

    // 1. Garantir Motorista e Veículo
    let driverId = (await db.select().from(drivers).limit(1))[0]?.id;
    let vehicleId = (await db.select().from(vehicles).limit(1))[0]?.id;

    if (!driverId || !vehicleId) {
        console.error("❌ Precisa ter pelo menos 1 motorista e 1 veículo no banco.");
        process.exit(1);
    }

    // 2. Criar Turno ANTIGO (Novembro 2024 - Deve ser 60/40)
    await db.insert(shifts).values({
        driverId,
        vehicleId,
        status: 'concluido',
        inicio: new Date('2024-11-01T08:00:00').toISOString(),
        fim: new Date('2024-11-01T18:00:00').toISOString(),
        kmInicial: 1000,
        kmFinal: 1200,
        totalBruto: 200,
        totalApp: 100,
        totalParticular: 100,
        totalCustos: 0,
        liquido: 200,
        repasseEmpresa: 120, // 60%
        repasseMotorista: 80, // 40%
        startPhoto: 'mock',
        endPhoto: 'mock',
        location: 'Test Location'
    });
    console.log("✅ Turno Antigo Criado (2024-11-01) - R$ 200 (60% = 120 / 40% = 80)");

    // 3. Criar Turno NOVO (Dezembro 2024 - Deve ser 50/50)
    await db.insert(shifts).values({
        driverId,
        vehicleId,
        status: 'concluido',
        inicio: new Date('2024-12-20T08:00:00').toISOString(),
        fim: new Date('2024-12-20T18:00:00').toISOString(),
        kmInicial: 2000,
        kmFinal: 2200,
        totalBruto: 300,
        totalApp: 150,
        totalParticular: 150,
        totalCustos: 0,
        liquido: 300,
        repasseEmpresa: 150, // 50%
        repasseMotorista: 150, // 50%
        startPhoto: 'mock',
        endPhoto: 'mock',
        location: 'Test Location'
    });
    console.log("✅ Turno Novo Criado (2024-12-20) - R$ 300 (50% = 150 / 50% = 150)");

    process.exit(0);
}

main().catch(console.error);
