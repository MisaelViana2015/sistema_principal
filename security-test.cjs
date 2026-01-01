// Security Testing Script - Black-box tests for Rota Verde API
const https = require('https');

const API_BASE = 'endpoint-api-production-f16d.up.railway.app';

function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: API_BASE,
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    const results = [];

    console.log('🔍 Iniciando testes de segurança Black-box...\n');

    // Test 1: Rate Limiting
    console.log('1️⃣ Testando Rate Limiting no Login...');
    let rateLimitHit = false;
    for (let i = 1; i <= 10; i++) {
        const res = await makeRequest('POST', '/api/auth/login', {
            email: 'bruteforce@test.com',
            senha: 'wrongpassword'
        });
        console.log(`   Tentativa ${i}: Status ${res.status}`);
        if (res.status === 429) {
            rateLimitHit = true;
            results.push({ test: 'Rate Limiting', status: '✅ OK', detail: `Bloqueado após ${i} tentativas` });
            break;
        }
    }
    if (!rateLimitHit) {
        results.push({ test: 'Rate Limiting', status: '⚠️ ATENÇÃO', detail: '10 tentativas sem bloqueio' });
    }

    // Test 2: User Enumeration
    console.log('\n2️⃣ Testando User Enumeration...');
    const resInvalid = await makeRequest('POST', '/api/auth/login', { email: 'naoexiste@fake.com', senha: 'x' });
    const resWrongPass = await makeRequest('POST', '/api/auth/login', { email: 'admin@rotaverde.com', senha: 'wrongpass' });
    const msgInvalid = JSON.parse(resInvalid.body).error || '';
    const msgWrongPass = JSON.parse(resWrongPass.body).error || '';
    if (msgInvalid === msgWrongPass) {
        results.push({ test: 'User Enumeration', status: '✅ OK', detail: 'Mensagens idênticas para user inexistente e senha errada' });
    } else {
        results.push({ test: 'User Enumeration', status: '❌ FALHA', detail: `Mensagens diferentes: "${msgInvalid}" vs "${msgWrongPass}"` });
    }

    // Test 3: Admin routes without auth
    console.log('\n3️⃣ Testando rotas admin sem autenticação...');
    const adminRoutes = [
        '/api/admin-tools/recalculate-page',
        '/api/fraud/dashboard-stats',
        '/api/financial/fixed-costs',
        '/api/drivers'
    ];
    for (const route of adminRoutes) {
        const res = await makeRequest('GET', route);
        const isProtected = res.status === 401 || res.status === 403;
        results.push({
            test: `Rota ${route}`,
            status: isProtected ? '✅ OK' : '❌ FALHA',
            detail: `Status: ${res.status}`
        });
    }

    // Test 4: CORS with malicious origin
    console.log('\n4️⃣ Testando CORS com origem maliciosa...');
    const corsRes = await makeRequest('GET', '/api/health', null, { 'Origin': 'https://evil.hacker.com' });
    const corsHeader = corsRes.headers['access-control-allow-origin'];
    if (!corsHeader || corsHeader === 'https://rt-frontend.up.railway.app') {
        results.push({ test: 'CORS Malicious Origin', status: '✅ OK', detail: `Origem não refletida: ${corsHeader || 'nenhuma'}` });
    } else {
        results.push({ test: 'CORS Malicious Origin', status: '❌ FALHA', detail: `Origem refletida: ${corsHeader}` });
    }

    // Test 5: HTTP Methods
    console.log('\n5️⃣ Testando métodos HTTP indevidos...');
    const methodsRes = await makeRequest('OPTIONS', '/api/health');
    results.push({ test: 'OPTIONS Response', status: '✅ INFO', detail: `Status: ${methodsRes.status}` });

    // Test 6: Error message leakage
    console.log('\n6️⃣ Testando vazamento de stack trace...');
    const errorRes = await makeRequest('POST', '/api/auth/login', { invalid: 'data' });
    const hasStackTrace = errorRes.body.includes('at ') || errorRes.body.includes('node_modules');
    results.push({
        test: 'Stack Trace Leakage',
        status: hasStackTrace ? '❌ FALHA' : '✅ OK',
        detail: hasStackTrace ? 'Stack trace exposto' : 'Erro genérico retornado'
    });

    // Test 7: Large payload
    console.log('\n7️⃣ Testando payload grande...');
    const largePayload = { email: 'a'.repeat(100000), senha: 'test' };
    const largeRes = await makeRequest('POST', '/api/auth/login', largePayload);
    results.push({
        test: 'Large Payload',
        status: largeRes.status === 413 ? '✅ OK' : '⚠️ ATENÇÃO',
        detail: `Status: ${largeRes.status} (esperado 413)`
    });

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADOS DOS TESTES DE SEGURANÇA');
    console.log('='.repeat(60) + '\n');

    for (const r of results) {
        console.log(`${r.status} ${r.test}`);
        console.log(`   └─ ${r.detail}\n`);
    }

    // Summary
    const passed = results.filter(r => r.status.includes('OK')).length;
    const failed = results.filter(r => r.status.includes('FALHA')).length;
    const warnings = results.filter(r => r.status.includes('ATENÇÃO')).length;

    console.log('='.repeat(60));
    console.log(`RESUMO: ${passed} OK | ${warnings} Atenção | ${failed} Falhas`);
    console.log('='.repeat(60));
}

runTests().catch(console.error);
