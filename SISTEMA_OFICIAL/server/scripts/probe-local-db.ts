
import pg from 'pg';
const { Client } = pg;

async function probe(connectionString: string): Promise<boolean> {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        await client.end();
        return true;
    } catch (err) {
        return false;
    }
}

async function main() {
    console.log("🕵️‍♂️ Sondando credenciais locais com senha do Railway...");

    const railwayPass = "QGtJKrxgQqoPYFDQraMZyXdBJxeuJuIM";

    // Lista de tentativas locais
    const candidates = [
        `postgresql://postgres:${railwayPass}@localhost:5432/postgres`,
        `postgresql://postgres:${railwayPass}@localhost:5432/railway`,
        `postgresql://postgres:${railwayPass}@localhost:5432/rotaverde`,
        // Tentativas comuns
        "postgresql://postgres:postgres@localhost:5432/postgres",
        "postgresql://postgres:admin@localhost:5432/postgres",
        "postgresql://postgres:123456@localhost:5432/postgres"
    ];

    for (const url of candidates) {
        // Ocultar senha no log para segurança visual
        const displayUrl = url.replace(railwayPass, "***RAILWAY_PASS***");
        process.stdout.write(`Testando: ${displayUrl} ... `);

        const success = await probe(url);
        if (success) {
            console.log("✅ SUCESSO!");
            console.log(`\n🎉 Credencial encontrada: ${url}`);
            process.exit(0);
        } else {
            console.log("❌ Falhou");
        }
    }

    console.log("\n❌ Nenhuma credencial padrão funcionou.");
    process.exit(1);
}

main();
