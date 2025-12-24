
import { Client } from 'pg';

const client = new Client({
    connectionString: 'postgresql://postgres:QGtJKrxgQqoPYFDQraMZyXdBJxeuJuIM@crossover.proxy.rlwy.net:50382/railway',
});

async function check() {
    await client.connect();
    try {
        const res = await client.query("SELECT * FROM fixed_costs WHERE name LIKE 'Teste Recorrencia%' ORDER BY start_date DESC LIMIT 1");
        if (res.rowCount > 0) {
            const cost = res.rows[0];
            console.log("Cost Found:", cost.name, "ID:", cost.id, "Total Installments:", cost.total_installments);

            const inst = await client.query("SELECT * FROM fixed_cost_installments WHERE fixed_cost_id = $1", [cost.id]);
            console.log("Installments found:", inst.rowCount);
            inst.rows.forEach(r => console.log(` - #${r.installment_number}: ${r.due_date} | ${r.value}`));
        } else {
            console.log("No test cost found.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
