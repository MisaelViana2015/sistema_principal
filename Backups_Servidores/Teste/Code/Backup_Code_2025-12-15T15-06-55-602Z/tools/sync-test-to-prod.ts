
import postgres from 'postgres';
import * as dotenv from 'dotenv';
dotenv.config();

// Configurações
const TEST_DB_URL = process.env.DATABASE_URL; // Local .env points to TEST (turntable)
// URL de Produção fornecida pelo usuário
const PROD_DB_URL = 'postgresql://postgres:hkNUwGMmREdjqCDOmHkalRELQAgJPyWv@yamanote.proxy.rlwy.net:33836/railway';

async function main() {
    if (!TEST_DB_URL) {
        throw new Error("DATABASE_URL (Teste) não encontrada no .env");
    }

    console.log("🔄 INICIANDO SINCRONIZAÇÃO: TESTE -> PRODUÇÃO");
    console.log(`📡 Origem (Teste): ${TEST_DB_URL.split('@')[1]}`);
    console.log(`📡 Destino (Prod): ${PROD_DB_URL.split('@')[1]}`);
    console.log("\n⚠️  ATENÇÃO: ISSO VAI APAGAR TODOS OS DADOS DE PRODUÇÃO!");
    console.log("⏳ Aguardando 5 segundos antes de começar...");

    await new Promise(r => setTimeout(r, 5000));

    const sqlTest = postgres(TEST_DB_URL);
    const sqlProd = postgres(PROD_DB_URL);

    try {
        // 1. Limpar tabela destino (Ordem inversa para evitar FK constraint errors)
        console.log("\n🗑️  Limpando tabelas antigas...");
        const tables = ['expenses', 'rides', 'shifts', 'vehicles', 'fixed_costs', 'cost_types', 'drivers'];
        for (const table of tables) {
            // Usar TRUNCATE CASCADE é perigoso se não tiver certeza, DELETE é mais seguro p/ scripts simples
            // Mas vamos de DELETE para garantir
            await sqlProd.unsafe(`DELETE FROM ${table}`);
            console.log(`   - ${table} limpa.`);
        }

        // 2. Copiar dados (Ordem de dependência)
        // Ordem: drivers -> vehicles -> cost_types -> fixed_costs -> shifts -> rides -> expenses
        const copyOrder = ['drivers', 'cost_types', 'fixed_costs', 'vehicles', 'shifts', 'rides', 'expenses'];

        for (const table of copyOrder) {
            console.log(`\n📦 Migrando: ${table}...`);
            const rows = await sqlTest.unsafe(`SELECT * FROM ${table}`);

            if (rows.length === 0) {
                console.log(`   (0 registros encontrados)`);
                continue;
            }

            console.log(`   Transferindo ${rows.length} registros...`);
            // Insert em lotes (Transaction)
            await sqlProd.begin(async sql => {
                for (const row of rows) {
                    await sql.unsafe(`INSERT INTO ${table} ${sqlProd(row)}`);
                }
            });
            console.log(`   ✅ Sucesso!`);
        }

        console.log("\n🎉 SINCRONIZAÇÃO CONCLUÍDA COM SUCESSO!");

    } catch (error) {
        console.error("\n❌ ERRO FATAL DURANTE A SINCRONIZAÇÃO:", error);
    } finally {
        await sqlTest.end();
        await sqlProd.end();
    }
}

main();
