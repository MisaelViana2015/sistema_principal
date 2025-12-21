
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// ESM dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from various potential locations
// 1. server/.env
// 2. root/.env
// 3. defined in environment already
dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // Root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") }); // Server .env

async function validate() {
    console.log("\n🔍 Validating Database Connection Locally...");
    console.log("-----------------------------------------");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ DATABASE_URL is not defined.");
        console.log("👉 Please ensure you have a .env file with DATABASE_URL set.");
        console.log("   Expected format: postgres://user:pass@host:port/dbname");
        process.exit(1);
    }

    // Mask password for logging
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    console.log(`🔌 Connecting to: ${maskedUrl}`);

    // Basic parsing check
    try {
        const urlParts = new URL(dbUrl);
        console.log(`   - Host: ${urlParts.hostname}`);
        console.log(`   - Port: ${urlParts.port || 5432}`);
        console.log(`   - Database: ${urlParts.pathname.slice(1)}`);
    } catch (e) {
        console.error("⚠️  Could not parse DATABASE_URL with URL constructor. Might be invalid format.");
    }

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes("railway.app") ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 10000, // 10s timeout
    });

    try {
        const client = await pool.connect();
        console.log("✅ CONNECTED! Connection established successfully.");

        const res = await client.query("SELECT NOW() as now, current_database() as db_name, version()");
        console.log("\n📊 Verification Query Result:");
        console.log(`   - Time (Server): ${res.rows[0].now}`);
        console.log(`   - Connected DB:  ${res.rows[0].db_name}`);
        console.log(`   - PG Version:    ${res.rows[0].version}`);

        client.release();
        await pool.end();
        console.log("\n✅ SUCCESS: Database connection is healthy and working from this machine.");
        process.exit(0);
    } catch (err: any) {
        console.error("\n❌ CONNECTION FAILED!");
        console.error("-----------------------------------------");
        console.error(`Error detected: ${err.message}`);
        if (err.code) console.error(`Code: ${err.code}`);
        if (err.syscall) console.error(`Syscall: ${err.syscall}`);
        if (err.hostname) console.error(`Hostname: ${err.hostname}`);

        console.error("\n👉 Troubleshooting Tips:");
        if (err.code === 'ENOTFOUND') {
            console.error("   - The hostname could not be resolved. Check if the 'Host' is correct.");
            console.error("   - If using Railway, ensure you are using the PROXY URL (Public), not the internal one, for local tests.");
        }
        if (err.code === 'ETIMEDOUT') {
            console.error("   - Connection timed out. Check firewall or if the database is reachable.");
        }
        if (err.message.includes("password authentication failed")) {
            console.error("   - Check your username and password.");
        }

        await pool.end();
        process.exit(1);
    }
}

validate();
