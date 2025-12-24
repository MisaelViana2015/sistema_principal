
import { Client } from 'pg';

const client = new Client({
    connectionString: 'postgresql://postgres:QGtJKrxgQqoPYFDQraMZyXdBJxeuJuIM@crossover.proxy.rlwy.net:50382/railway',
});

async function check() {
    await client.connect();
    try {
        const res = await client.query("SELECT COUNT(*) FROM fixed_costs");
        console.log("Total Fixed Costs:", res.rows[0].count);

        const rows = await client.query("SELECT * FROM fixed_costs LIMIT 20");
        console.log("Rows:", rows.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
