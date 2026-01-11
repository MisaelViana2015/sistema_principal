
import { db } from "../server/core/db/connection.js";
import { maintenanceConfigs } from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🛠️ Atualizando intervalos de manutenção...");

    // 1. Atualizar Revisão para 20.000 km
    const res1 = await db.update(maintenanceConfigs)
        .set({ intervalKm: 20000 })
        .where(sql`name ILIKE '%Revisão%' OR name ILIKE '%Óleo%'`)
        .returning();

    console.log(`✅ ${res1.length} configurações de Revisão atualizadas para 20.000 km.`);

    // 2. Atualizar Pneus para 5.000 km
    const res2 = await db.update(maintenanceConfigs)
        .set({ intervalKm: 5000 })
        .where(sql`name ILIKE '%Pneu%' OR name ILIKE '%Rodízio%'`)
        .returning();

    console.log(`✅ ${res2.length} configurações de Pneus atualizadas para 5.000 km.`);

    console.log("🏁 Concluído!");
    process.exit(0);
}

main().catch(console.error);
