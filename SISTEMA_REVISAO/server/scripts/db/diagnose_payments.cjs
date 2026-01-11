/**
 * Script de Diagnóstico: Fluxo de Pagamento de Custos Fixos
 *
 * Este script verifica:
 * 1. Se as colunas paid_amount e paid_date existem na tabela
 * 2. Se há parcelas com paid_amount preenchido
 * 3. O que a API está retornando
 */

const { Pool } = require('pg');

// Usa a mesma configuração do sistema
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://USER:PASSWORD@localhost:5432/DATABASE';

async function runDiagnostics() {
    console.log('🔍 DIAGNÓSTICO DE PAGAMENTO DE CUSTOS FIXOS\n');
    console.log('='.repeat(60));

    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
    });

    try {
        // 1. Verificar se as colunas existem
        console.log('\n📋 1. VERIFICANDO ESTRUTURA DA TABELA...\n');

        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'fixed_cost_installments'
            ORDER BY ordinal_position
        `);

        console.log('Colunas em fixed_cost_installments:');
        columnsResult.rows.forEach(col => {
            const marker = ['paid_amount', 'paid_date'].includes(col.column_name) ? '⭐' : '  ';
            console.log(`${marker} ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        const hasPaidAmount = columnsResult.rows.some(c => c.column_name === 'paid_amount');
        const hasPaidDate = columnsResult.rows.some(c => c.column_name === 'paid_date');

        console.log(`\n✅ paid_amount existe: ${hasPaidAmount}`);
        console.log(`✅ paid_date existe: ${hasPaidDate}`);

        if (!hasPaidAmount || !hasPaidDate) {
            console.log('\n🚨 PROBLEMA ENCONTRADO: Colunas não existem no banco!');
            console.log('   O servidor precisa reiniciar para executar ensureSchemaIntegrity.');
            return;
        }

        // 2. Verificar parcelas pagas
        console.log('\n📋 2. VERIFICANDO PARCELAS PAGAS...\n');

        const paidResult = await pool.query(`
            SELECT
                fci.id,
                fc.name as cost_name,
                fci.valor,
                fci.status,
                fci.paid_amount,
                fci.paid_date,
                fci.due_date
            FROM fixed_cost_installments fci
            JOIN fixed_costs fc ON fci.fixed_cost_id = fc.id
            WHERE fci.status = 'Pago'
            ORDER BY fci.paid_date DESC NULLS LAST
            LIMIT 10
        `);

        console.log(`Encontradas ${paidResult.rows.length} parcelas pagas (mostrando até 10):\n`);

        if (paidResult.rows.length === 0) {
            console.log('   Nenhuma parcela com status "Pago" encontrada.');
        } else {
            paidResult.rows.forEach((row, i) => {
                console.log(`${i + 1}. ${row.cost_name}`);
                console.log(`   Valor Original: R$ ${row.valor}`);
                console.log(`   Valor Pago:     ${row.paid_amount !== null ? 'R$ ' + row.paid_amount : '❌ NULL'}`);
                console.log(`   Data Pago:      ${row.paid_date !== null ? row.paid_date : '❌ NULL'}`);
                console.log(`   Vencimento:     ${row.due_date}`);
                console.log('');
            });
        }

        // 3. Verificar se há algum paid_amount não-null
        const countResult = await pool.query(`
            SELECT
                COUNT(*) as total_pagas,
                COUNT(paid_amount) as com_paid_amount,
                COUNT(paid_date) as com_paid_date
            FROM fixed_cost_installments
            WHERE status = 'Pago'
        `);

        const counts = countResult.rows[0];
        console.log('📋 3. ESTATÍSTICAS:\n');
        console.log(`   Total de parcelas pagas: ${counts.total_pagas}`);
        console.log(`   Com paid_amount preenchido: ${counts.com_paid_amount}`);
        console.log(`   Com paid_date preenchido: ${counts.com_paid_date}`);

        if (counts.total_pagas > 0 && counts.com_paid_amount === '0') {
            console.log('\n🚨 PROBLEMA ENCONTRADO: Parcelas estão marcadas como "Pago" mas paid_amount está NULL!');
            console.log('   Isso indica que o UPDATE não está salvando o campo paid_amount.');
            console.log('   Verifique a função updateFixedCostInstallment no repository.');
        }

        // 4. Verificar última atualização
        console.log('\n📋 4. ÚLTIMA PARCELA ATUALIZADA:\n');

        const lastUpdate = await pool.query(`
            SELECT
                fci.id,
                fc.name,
                fci.valor,
                fci.paid_amount,
                fci.paid_date,
                fci.status
            FROM fixed_cost_installments fci
            JOIN fixed_costs fc ON fci.fixed_cost_id = fc.id
            ORDER BY fci.id DESC
            LIMIT 1
        `);

        if (lastUpdate.rows.length > 0) {
            const row = lastUpdate.rows[0];
            console.log(`   Nome: ${row.name}`);
            console.log(`   Status: ${row.status}`);
            console.log(`   Valor Original: R$ ${row.valor}`);
            console.log(`   Valor Pago: ${row.paid_amount !== null ? 'R$ ' + row.paid_amount : 'NULL'}`);
            console.log(`   Data Pago: ${row.paid_date !== null ? row.paid_date : 'NULL'}`);
        }

    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
    } finally {
        await pool.end();
    }
}

runDiagnostics();
