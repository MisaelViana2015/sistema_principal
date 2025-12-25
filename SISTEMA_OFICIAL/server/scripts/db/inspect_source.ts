import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const SOURCE_DB_URL = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";
const START_DATE = "2025-12-18T00:00:00.000Z";

async function inspectSource() {
    console.log("🔌 Connecting to SOURCE DB...");
    const client = new Client({ connectionString: SOURCE_DB_URL });

    try {
        await client.connect();
        console.log("✅ Connected!");

        // 1. SHIFTS (Turnos)
        const shiftsRes = await client.query(`
            SELECT count(*) as count, min(start_time) as first, max(start_time) as last 
            FROM shifts 
            WHERE start_time >= $1
        `, [START_DATE]);
        console.log(`\n📊 SHIFTS since 18/12: ${shiftsRes.rows[0].count}`);
        if (shiftsRes.rows[0].count > 0) {
            console.log(`   Range: ${shiftsRes.rows[0].first} -> ${shiftsRes.rows[0].last}`);
        }

        // 2. RIDES (Corridas)
        // Rides usually link to shifts, or have their own timestamp. Checking timestamp.
        const ridesRes = await client.query(`
            SELECT count(*) as count, sum(amount) as total_amount
            FROM rides 
            WHERE timestamp >= $1
        `, [START_DATE]);
        console.log(`📊 RIDES since 18/12: ${ridesRes.rows[0].count}`);
        console.log(`   Total Value: R$ ${ridesRes.rows[0].total_amount}`);

        // 3. COSTS (Custos / Expenses) based on Shifts
        // Assuming 'expenses' table linked to session/shift or just date
        // Let's check 'expenses' table (generic)
        try {
            const expensesRes = await client.query(`
                SELECT count(*) as count, sum(amount) as total
                FROM expenses
                WHERE date >= $1
            `, [START_DATE]);
            console.log(`📊 EXPENSES (Custos) since 18/12: ${expensesRes.rows[0].count}`);
            console.log(`   Total: R$ ${expensesRes.rows[0].total}`);
        } catch (e: any) {
            console.log("   (Could not query 'expenses' directly, might be named differently)");
        }

    } catch (err: any) {
        console.error("❌ Connection Failed:", err.message);
    } finally {
        await client.end();
    }
}

inspectSource();
