// Quick import for December 16 shifts - Test with just Robson
import { db } from "./server/core/db/connection.js";
import { drivers, vehicles, shifts, rides } from "./shared/schema.js";
import { eq } from "drizzle-orm";

console.log("Starting import...");

// Test with just one shift first
const testShift = {
    driver: "Robson",
    vehicle: "TQQ0A94",
    date: "2025-12-16",
    start: "09:14",
    end: "14:31",
    km: 65,
    rides: [
        { time: "09:44", value: 14.40, type: "Aplicativo" },
        { time: "10:06", value: 18.00, type: "Aplicativo" },
        { time: "11:09", value: 12.90, type: "Aplicativo" },
        { time: "11:36", value: 24.20, type: "Aplicativo" },
        { time: "12:40", value: 15.80, type: "Aplicativo" },
        { time: "12:51", value: 14.00, type: "Aplicativo" },
        { time: "13:07", value: 15.00, type: "Particular" },
        { time: "13:22", value: 15.00, type: "Aplicativo" },
    ]
};

try {
    // Find driver
    const [driver] = await db.select().from(drivers).where(eq(drivers.nome, testShift.driver));
    if (!driver) throw new Error(`Driver ${testShift.driver} not found`);
    console.log("✓ Found driver:", driver.nome);

    // Find vehicle
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.plate, testShift.vehicle));
    if (!vehicle) throw new Error(`Vehicle ${testShift.vehicle} not found`);
    console.log("✓ Found vehicle:", vehicle.plate);

    // Calculate totals
    const totalApp = testShift.rides.filter(r => r.type === "Aplicativo").reduce((sum, r) => sum + r.value, 0);
    const totalParticular = testShift.rides.filter(r => r.type === "Particular").reduce((sum, r) => sum + r.value, 0);
    const totalBruto = totalApp + totalParticular;

    console.log(`Totals: App=${totalApp}, Part=${totalParticular}, Bruto=${totalBruto}`);

    // Create shift
    const [newShift] = await db.insert(shifts).values({
        driverId: driver.id,
        vehicleId: vehicle.id,
        inicio: new Date(`${testShift.date}T${testShift.start}:00-03:00`),
        fim: new Date(`${testShift.date}T${testShift.end}:00-03:00`),
        status: "finalizado",
        kmInicial: 0,
        kmFinal: testShift.km,
        totalApp,
        totalParticular,
        totalBruto,
        totalCustos: 0,
        liquido: totalBruto,
        repasseEmpresa: totalBruto * 0.6,
        repasseMotorista: totalBruto * 0.4,
    }).returning();

    console.log("✓ Shift created:", newShift.id);

    // Create rides
    for (const ride of testShift.rides) {
        await db.insert(rides).values({
            shiftId: newShift.id,
            tipo: ride.type,
            valor: ride.value,
            hora: new Date(`${testShift.date}T${ride.time}:00-03:00`),
        });
    }

    console.log(`✓ ${testShift.rides.length} rides created`);
    console.log("✅ Import successful!");

} catch (error) {
    console.error("❌ Error:", error);
}

process.exit(0);
