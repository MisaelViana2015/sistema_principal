
const https = require('https');

// Configuração
const API_BASE = 'endpoint-api-production-f16d.up.railway.app';
const ENDPOINT = '/api/shifts/start'; // Exemplo de endpoint crítico
const CONCURRENCY = 5;

// Mock de Token (Idealmente pegaria um real ou mockaria o backend localmente)
// Como é um teste de robustez, o foco é ver se o servidor lida com simultaneidade.
// Se não tivermos token, vamos receber 401, o que também é um teste.
// Para teste real, precisaríamos de login.
const TOKEN = "DY_DUMMY_TOKEN";

async function sendRequest(id) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            vehicleId: "car_123",
            kmInicial: 1000
        });

        const options = {
            hostname: API_BASE,
            port: 443,
            path: ENDPOINT,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                resolve({ id, status: res.statusCode, body });
            });
        });

        req.on('error', (e) => {
            resolve({ id, status: 'ERROR', error: e.message });
        });

        req.write(data);
        req.end();
    });
}

async function runRaceTest() {
    console.log(`🏎️  Iniciando Teste de "Race Condition" (Concorrência)...`);
    console.log(`    Disparando ${CONCURRENCY} requisições SIMULTÂNEAS para iniciar turno no mesmo carro.`);

    const promises = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        promises.push(sendRequest(i + 1));
    }

    const results = await Promise.all(promises);

    console.log("\n📊 Resultados:");
    let successCount = 0;
    let failCount = 0;

    results.forEach(r => {
        console.log(`    Req #${r.id}: Status ${r.status}`);
        if (r.status === 200 || r.status === 201) successCount++;
        else failCount++;
    });

    console.log("\n📝 Análise:");
    if (successCount > 1) {
        console.error("❌ FALHA CRÍTICA: Mais de uma requisição teve sucesso! Race condition detectada.");
    } else if (successCount === 1) {
        console.log("✅ SUCESSO: Apenas 1 requisição passou. Lock funcionou.");
    } else {
        console.log("ℹ️  Sem sucessos (provavelmente Auth falhou ou validação impediu todos). Verifique logs.");
    }
}

runRaceTest().catch(console.error);
