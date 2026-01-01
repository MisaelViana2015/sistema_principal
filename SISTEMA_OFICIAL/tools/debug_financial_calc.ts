
import { db } from "../server/core/db/connection";
import { shifts, expenses } from "../shared/schema";
import { sql, eq, desc } from "drizzle-orm";

async function debugFinancials() {
    console.log("🔍 Debugging Financial KPI Calculations...");

    // 1. Fetch limit 1000 shifts (simulating frontend)
    const shiftsData = await db.select().from(shifts).orderBy(desc(shifts.inicio)).limit(1000);

    // 2. Fetch all expenses
    const expensesData = await db.select().from(expenses);

    // 3. Calculate Totals like Frontend KPI (Naive)
    const totalRepasseEmpresa = shiftsData.reduce((acc, s) => acc + (Number(s.repasseEmpresa) || 0), 0);

    // Frontend Logic: acc + (Number(c.valor) || 0) (Ignores split)
    const totalCustosVariaveis_Naive = expensesData.reduce((acc, c) => acc + (Number(c.value) || 0), 0);

    // Correct Logic: Handle Split
    const totalCustosVariaveis_Correct = expensesData.reduce((acc, c) => {
        const val = Number(c.value) || 0;
        if (c.isSplitCost) return acc + (val * 0.5);
        return acc + val;
    }, 0);

    const lucroLiquido_Naive = totalRepasseEmpresa - totalCustosVariaveis_Naive;
    const lucroLiquido_Correct = totalRepasseEmpresa - totalCustosVariaveis_Correct;

    console.log(`\n📊 Data Counts:`);
    console.log(`   - Shifts fetched: ${shiftsData.length}`);
    console.log(`   - Expenses fetched: ${expensesData.length}`);

    console.log(`\n💰 Revenue (Repasse Empresa): R$ ${totalRepasseEmpresa.toFixed(2)}`);

    console.log(`\n📉 Costs Analysis:`);
    console.log(`   - Naive Sum (All 100%):    R$ ${totalCustosVariaveis_Naive.toFixed(2)}`);
    console.log(`   - Correct Sum (Split 50%): R$ ${totalCustosVariaveis_Correct.toFixed(2)}`);
    console.log(`   - Difference:              R$ ${(totalCustosVariaveis_Naive - totalCustosVariaveis_Correct).toFixed(2)}`);

    console.log(`\n🏁 Net Profit (Lucro Líquido):`);
    console.log(`   - CURRENT UI (Naive):      R$ ${lucroLiquido_Naive.toFixed(2)}`);
    console.log(`   - EXPECTED (Correct):      R$ ${lucroLiquido_Correct.toFixed(2)}`);

    process.exit(0);
}

debugFinancials();
