
import pg from 'pg';
const { Client } = pg;

async function probe(url: string, timeout = 2000): Promise<boolean> {
    const client = new Client({ connectionString: url, connectionTimeoutMillis: timeout });
    try {
        await client.connect();
        await client.end();
        return true;
    } catch (err) {
        return false;
    }
}

async function main() {
    console.log("🔓 Tentando força bruta suave no Localhost...");

    const passwords = [
        "postgres", "admin", "123456", "root", "password", "senha",
        "rotaverde", "masterkey", "123", "1234", "12345",
        "postgres123", "admin123", "sistema"
    ];

    // Usuários comuns
    const users = ["postgres", "admin"];

    // Bancos prováveis
    const dbs = ["postgres", "rotaverde", "railway", "template1"];

    let attempts = 0;

    for (const user of users) {
        for (const pass of passwords) {
            for (const db of dbs) {
                const url = `postgresql://${user}:${pass}@localhost:5432/${db}`;
                if (attempts++ % 10 === 0) process.stdout.write('.'); // Feedback visual

                if (await probe(url)) {
                    console.log(`\n\n🎯 ALVO ENCONTRADO!`);
                    console.log(`URL: ${url}`);
                    console.log(`Credenciais: User=${user}, Pass=${pass}, DB=${db}`);
                    process.exit(0);
                }
            }
        }
    }

    // Tentar sem senha (trust)
    for (const user of users) {
        for (const db of dbs) {
            const url = `postgresql://${user}@localhost:5432/${db}`;
            if (await probe(url)) {
                console.log(`\n\n🎯 ALVO ENCONTRADO (SEM SENHA)!`);
                console.log(`URL: ${url}`);
                process.exit(0);
            }
        }
    }

    console.log("\n❌ Falha: Nenhuma combinação funcionou.");
    process.exit(1);
}

main();
