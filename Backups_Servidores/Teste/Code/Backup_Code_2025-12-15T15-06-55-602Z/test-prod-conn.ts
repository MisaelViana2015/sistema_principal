
import postgres from 'postgres';

const PROD_URL = 'postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway';

async function test() {
    console.log('Connecting to PROD...');
    const sql = postgres(PROD_URL, { ssl: { rejectUnauthorized: false }, max: 1 });
    try {
        const result = await sql`SELECT version()`;
        console.log('Connected! Version:', result[0].version);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await sql.end();
    }
}

test();
