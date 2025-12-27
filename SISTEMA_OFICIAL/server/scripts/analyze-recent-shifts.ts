
import { db } from "./core/db/connection.js";
import { shifts, fraudEvents } from "../shared/schema.js";
import { FraudService } from "./modules/fraud/fraud.service.js";
import { desc, eq } from "drizzle-orm";

async function analyzeRecentShifts() {
    console.log("🔍 Iniciando análise de fraudes em turnos recentes...");

    // 1. Buscar os últimos 20 turnos finalizados
    const recentShifts = await db.query.shifts.findMany({
        where: eq(shifts.status, 'finalizado'),
        orderBy: [desc(shifts.fim)],
        limit: 20
    });

    console.log(`📦 Encontrados ${recentShifts.length} turnos finalizados para análise.\n`);

    let fraudCount = 0;

    for (const shift of recentShifts) {
        console.log(`▶️ Analisando Turno ${shift.id.slice(0, 8)} (Motorista: ${shift.driverId})...`);
        try {
            const result = await FraudService.analyzeShift(shift.id);

            if (result.riskLevel !== 'low') {
                fraudCount++;
                console.log(`   🚨 RISCO DETECTADO!`);
                console.log(`      Score: ${result.riskScore}`);
                console.log(`      Nível: ${result.riskLevel}`);
                console.log(`      Regras:`);
                result.rules.forEach(r => console.log(`        - [${r.severity}] ${r.label}`));
            } else {
                console.log(`   ✅ Sem risco identificado (Score: ${result.riskScore}).`);
            }
        } catch (error: any) {
            console.error(`   ❌ Erro ao analisar turno: ${error.message}`);
        }
        console.log('---');
    }

    console.log(`\n🏁 Análise concluída.`);
    console.log(`📊 Total analisado: ${recentShifts.length}`);
    console.log(`🚨 Fraudes detectadas: ${fraudCount}`);
}

analyzeRecentShifts().catch(console.error).then(() => process.exit(0));
