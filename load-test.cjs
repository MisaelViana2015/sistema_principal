// Controlled Load Test - Light (2 requests/second max)
const https = require('https');

const API_BASE = 'endpoint-api-production-f16d.up.railway.app';
const DURATION_SECONDS = parseInt(process.argv[2]) || 30;
const REQUESTS_PER_SECOND = 2; // Very light load

let totalRequests = 0;
let successCount = 0;
let errorCount = 0;
let blockedCount = 0; // 429 responses
let latencies = [];
let startTime = Date.now();

function makeRequest() {
    return new Promise((resolve) => {
        const reqStart = Date.now();
        const options = {
            hostname: API_BASE,
            port: 443,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };

        const req = https.request(options, (res) => {
            const latency = Date.now() - reqStart;
            latencies.push(latency);
            totalRequests++;

            if (res.statusCode === 200) {
                successCount++;
            } else if (res.statusCode === 429) {
                blockedCount++;
            } else {
                errorCount++;
            }
            resolve({ status: res.statusCode, latency });
        });

        req.on('error', () => {
            errorCount++;
            totalRequests++;
            resolve({ status: 'error', latency: Date.now() - reqStart });
        });

        req.on('timeout', () => {
            req.destroy();
            errorCount++;
            totalRequests++;
            resolve({ status: 'timeout', latency: 5000 });
        });

        req.end();
    });
}

async function runLoadTest() {
    console.log(`\n🔥 TESTE DE CARGA CONTROLADO`);
    console.log(`   Duração: ${DURATION_SECONDS} segundos`);
    console.log(`   Taxa: ${REQUESTS_PER_SECOND} req/s (muito leve)`);
    console.log(`   Alvo: ${API_BASE}`);
    console.log(`${'─'.repeat(50)}\n`);

    const interval = 1000 / REQUESTS_PER_SECOND;
    const endTime = Date.now() + (DURATION_SECONDS * 1000);

    while (Date.now() < endTime) {
        const result = await makeRequest();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const statusIcon = result.status === 200 ? '✓' : result.status === 429 ? '🚫' : '✗';
        process.stdout.write(`\r   [${elapsed}s] Requests: ${totalRequests} | OK: ${successCount} | Blocked: ${blockedCount} | Errors: ${errorCount} | Last: ${result.latency}ms ${statusIcon}   `);

        // Wait for next request (maintain rate)
        await new Promise(r => setTimeout(r, interval));
    }

    // Final stats
    const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
    const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
    const p95Index = Math.floor(latencies.length * 0.95);
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const p95Latency = sortedLatencies[p95Index] || 0;

    console.log(`\n\n${'═'.repeat(50)}`);
    console.log(`📊 RESULTADOS DO TESTE DE CARGA`);
    console.log(`${'═'.repeat(50)}`);
    console.log(`\n📈 Volume:`);
    console.log(`   Total Requests:  ${totalRequests}`);
    console.log(`   Sucesso (200):   ${successCount} (${((successCount / totalRequests) * 100).toFixed(1)}%)`);
    console.log(`   Bloqueado (429): ${blockedCount}`);
    console.log(`   Erros:           ${errorCount}`);

    console.log(`\n⏱️  Latência:`);
    console.log(`   Mínima:  ${minLatency} ms`);
    console.log(`   Média:   ${avgLatency} ms`);
    console.log(`   P95:     ${p95Latency} ms`);
    console.log(`   Máxima:  ${maxLatency} ms`);

    console.log(`\n🔒 Segurança:`);
    if (blockedCount > 0) {
        console.log(`   ✅ Rate limiting ATIVO (${blockedCount} bloqueios)`);
    } else if (totalRequests > 50) {
        console.log(`   ⚠️  Rate limiting pode estar muito permissivo`);
    } else {
        console.log(`   ℹ️  Carga muito baixa para testar rate limiting`);
    }

    console.log(`\n${'═'.repeat(50)}\n`);
}

runLoadTest().catch(console.error);
