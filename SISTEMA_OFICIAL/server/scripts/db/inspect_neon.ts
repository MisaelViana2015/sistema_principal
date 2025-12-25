import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const NEON_DB_URL = "postgresql://neondb_owner:npg_svFb6cjwPY5f@ep-orange-night-a6gk9al8.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function inspect() {
    console.log("🕵️ Inspecting Neon DB (17/12)...");
    const client = new Client({ connectionString: NEON_DB_URL });

    try {
        await client.connect();

        const start = "2025-12-17T00:00:00.000Z";
        const end = "2025-12-18T00:00:00.000Z";

        const shifts = await client.query("SELECT count(*) FROM shifts WHERE inicio >= $1 AND inicio < $2", [start, end]);

        console.log(`\n📅 Data for 17/12:`);
        console.log(`   - Shifts: ${shifts.rows[0].count}`);

        // Rides usually link to shifts, but let's check raw count too if valid column
        // We remember previous DB had 'timestamp' column issues in 'rides', it might be 'hora' or linked via shift. 
        // Let's count rides linked to those shifts for accuracy.

        const shiftsData = (await client.query("SELECT id FROM shifts WHERE inicio >= $1 AND inicio < $2", [start, end])).rows;
        if (shiftsData.length > 0) {
            const ids = shiftsData.map((s: any) => `'${s.id}'`).join(",");
            const linkedRides = await client.query(`SELECT count(*) FROM rides WHERE shift_id IN (${ids})`);
            console.log(`   - Linked Rides: ${linkedRides.rows[0].count}`);
        } else {
            console.log(`   - Linked Rides: 0 (No shifts found)`);
        }

    } catch (e: any) {
        console.error("❌ Error:", e.message);
    } finally {
        await client.end();
    }
}

inspect();
