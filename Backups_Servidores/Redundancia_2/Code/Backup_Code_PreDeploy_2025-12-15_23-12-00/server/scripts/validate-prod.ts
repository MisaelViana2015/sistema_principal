
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { drivers, vehicles } from '../../shared/schema.ts';
import { sql } from 'drizzle-orm';

const connectionString = process.argv[2];

if (!connectionString) {
    console.error("❌ Por favor, forneça a URL de conexão como argumento!");
    console.log("Uso: npx ts-node server/scripts/validate-prod.ts \"postgres://...\"");
    process.exit(1);
}

const client = postgres(connectionString, { prepare: false, ssl: { rejectUnauthorized: false } });
const db = drizzle(client);

async function validate() {
    console.log("🔍 Conectando ao Banco de Produção...");

    try {
        // 1. Contar registros
        const driversCount = await db.select({ count: sql<number>`count(*)` }).from(drivers);
        const vehiclesCount = await db.select({ count: sql<number>`count(*)` }).from(vehicles);

        console.log("\n📊 Estatísticas:");
        console.log(`- Motoristas: ${driversCount[0].count}`);
        console.log(`- Veículos: ${vehiclesCount[0].count}`);

        // 2. Buscar Admin Misael
        console.log("\n👤 Verificando Admin (Misael):");
        const misael = await db.select().from(drivers).where(sql`${drivers.email} = 'programacao1215@hotmail.com'`);

        if (misael.length > 0) {
            console.log("✅ Usuário ENCONTRADO!");
            console.log(`ID: ${misael[0].id}`);
            console.log(`Nome: ${misael[0].nome}`);
            console.log(`Role: ${misael[0].role}`);
        } else {
            console.error("❌ Usuário 'programacao1215@hotmail.com' NÃO encontrado.");
            console.log("⚠️  O seed de produção pode não ter rodado.");
        }

    } catch (err) {
        console.error("❌ Erro na validação:", err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

validate();
