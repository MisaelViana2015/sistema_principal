
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { vehicles } from "../../shared/schema.js";

async function check() {
    try {
        console.log("🔍 Verificando veículos no banco...");
        const all = await db.select().from(vehicles);
        console.log(`✅ Total de veículos encontrados: ${all.length}`);
        if (all.length > 0) {
            console.log("🚗 Primeiro veículo:", all[0].plate, all[0].modelo);
        } else {
            console.log("❌ TABELA VAZIA!");
        }
    } catch (error) {
        console.error("❌ Erro ao buscar veículos:", error);
    }
    process.exit(0);
}

check();
