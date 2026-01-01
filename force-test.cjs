/**
 * AGGRESSIVE SECURITY SCAN - Rota Verde API
 * Taxa: 10 requisições por segundo (Carga moderada)
 * Objetivo: Testar limites de rate-limiting e robustez de entrada.
 */
const https = require('https');

const API_BASE = 'endpoint-api-production-f16d.up.railway.app';
const CONCURRENCY = 5;
const DURATION_MS = 30000; // 30 segundos de "ataque"

let total = 0;
let success = 0;
let blocked = 0;
let error = 0;
let startTime = Date.now();

function attack() {
    return new Promise((resolve) => {
        const options = {
            hostname: API_BASE,
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            total++;
            if (res.statusCode === 200) success++;
            else if (res.statusCode === 429) blocked++;
            else error++;
            resolve();
        });

        req.on('error', () => { error++; total++; resolve(); });
        req.write(JSON.stringify({ email: 'pentest@rotaverde.com', senha: Math.random().toString() }));
        req.end();
    });
}

async function runForcefulScan() {
    console.log(`🚀 INICIANDO ATAQUE CONTROLADO (FORÇA BRUTA / RATE LIMIT SCAN)...`);
    console.log(`   Taxa alvo: ~5-10 req/s`);

    const endTime = Date.now() + DURATION_MS;

    while (Date.now() < endTime) {
        const promises = [];
        for (let i = 0; i < CONCURRENCY; i++) {
            promises.push(attack());
        }
        await Promise.all(promises);

        const elapsed = (Date.now() - startTime) / 1000;
        process.stdout.write(`\r   [${elapsed.toFixed(1)}s] Total: ${total} | Sucesso: ${success} | Bloqueado (429): ${blocked} | Erros: ${error}   `);
    }

    console.log(`\n\n🏁 SCAN CONCLUÍDO.`);
    console.log(`   Resultado Final:`);
    console.log(`   - Total Requisições: ${total}`);
    console.log(`   - Bloqueios (429):   ${blocked}`);

    if (blocked > 0) {
        console.log(`\n✅ SUCESSO: Rate Limiting disparou e protegeu o servidor.`);
    } else {
        console.log(`\n❌ FALHA: O servidor aceitou todas as requisições sem bloquear. Risco de DoS/Brute-force.`);
    }
}

runForcefulScan().catch(console.error);
