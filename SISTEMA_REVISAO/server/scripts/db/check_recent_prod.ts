
import { Client } from 'pg';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    await client.connect();
    try {
        console.log("--- Latest 10 Fixed Costs (by start_date) ---");
        // Since we don't have created_at, relying on start_date
        const res = await client.query(`
        SELECT id, name, valor, start_date, is_active
        FROM fixed_costs
        ORDER BY start_date DESC
        LIMIT 10
    `);

        res.rows.forEach(r => {
            console.log(`[Start: ${r.start_date}] ${r.name} | Val: ${r.valor} | Active: ${r.is_active}`);
        });

        console.log("\n--- Latest 10 Installments (by due_date) ---");
        const inst = await client.query(`
        SELECT i.id, i.due_date, i.valor, i.status, f.name
        FROM fixed_cost_installments i
        JOIN fixed_costs f ON i.fixed_cost_id = f.id
        ORDER BY i.due_date DESC
        LIMIT 10
    `);
        inst.rows.forEach(r => {
            console.log(`[Due: ${r.due_date}] ${r.name} | Val: ${r.valor} | Status: ${r.status}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
