
import "dotenv/config";
import { db } from "../core/db/connection.js";
import { shifts, expenses } from "../../shared/schema.js";
import { eq, and } from "drizzle-orm";

async function verify() {
    try {
        console.log("🔍 Buscando turno aberto para motorista 'Misael' (ou primeiro ativo)...");

        // Tentar achar user pelo nome em Drivers, ou apenas pegar o primeiro shift aberto
        const [shift] = await db.select().from(shifts).where(eq(shifts.status, 'em_andamento')).limit(1);

        if (!shift) {
            console.log("❌ Nenhum turno em andamento encontrado.");
            process.exit(0);
        }

        console.log(`✅ Turno encontrado: ID=${shift.id}, DriverID=${shift.driverId}`);
        console.log(`📊 Totais Atuais no Banco:`);
        console.log(`   Custos (Total): ${shift.totalCustos}`);
        console.log(`   Custos Particulares: ${shift.totalCustosParticular}`);
        console.log(`   Líquido: ${shift.liquido}`);

        // Buscar Expenses Deste Turno
        console.log(`\n🔍 Buscando expenses do turno ${shift.id}...`);
        const expensesData = await db.select().from(expenses).where(eq(expenses.shiftId, shift.id));

        console.log(`📦 Expenses encontradas: ${expensesData.length}`);
        expensesData.forEach((e, i) => {
            console.log(`   [${i}] ID=${e.id}, Valor=${e.value}, IsParticular=${e.isParticular}, Type=${typeof e.value}`);
        });

        // Simular Recálculo
        const totalCustos = expensesData.reduce((sum, e) => sum + Number(e.value || 0), 0);
        const totalParticular = expensesData.filter(e => e.isParticular).reduce((sum, e) => sum + Number(e.value || 0), 0);

        console.log(`\n🧮 Cálculo Simulado:`);
        console.log(`   Total Custos (All): ${totalCustos}`);
        console.log(`   Total Particular: ${totalParticular}`);

        if (totalCustos === 0 && expensesData.length > 0) {
            console.log("❌ ALERTA: Expenses existem, mas soma deu 0. Verifique conversão de tipos.");
        }

    } catch (error) {
        console.error("❌ Erro:", error);
    }
    process.exit(0);
}

verify();
