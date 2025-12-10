import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

await client.connect();
const result = await client.query("SELECT id, nome, email, role, is_active FROM drivers;");
console.log("=== USUÁRIOS NO BANCO ===");
console.table(result.rows);
await client.end();
