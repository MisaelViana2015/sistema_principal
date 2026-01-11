
const { Client } = require('pg');
const { randomUUID } = require('crypto');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log("🚀 Iniciando migração de Vehicle Costs -> Fixed Costs...");
    await client.connect();

    try {
        // 1. Buscar todos os custos de veículo "Prestação"
        const result = await client.query(`
            SELECT * FROM vehicle_costs
            WHERE tipo ILIKE '%Prestação%'
            ORDER BY data_referencia ASC
        `);

        const rawCosts = result.rows;
        console.log(`📊 Encontrados ${rawCosts.length} registros.`);

        if (rawCosts.length === 0) {
            console.log("✅ Nada a migrar.");
            process.exit(0);
        }

        const groups = {};

        for (const cost of rawCosts) {
            const match = cost.descricao.match(/^(.*?)\s*\((\d+)\/(\d+)\)$/);

            let baseName = cost.descricao;
            let currentInstallment = 1;
            let totalInstallments = 1;

            if (match) {
                baseName = match[1].trim();
                currentInstallment = parseInt(match[2]);
                totalInstallments = parseInt(match[3]);
            }

            const key = `${baseName}_${cost.vehicle_id}`;
            if (!groups[key]) groups[key] = [];

            cost._meta = { baseName, currentInstallment, totalInstallments };
            groups[key].push(cost);
        }

        console.log(`📦 Grupos: ${Object.keys(groups).length}`);

        for (const groupKey of Object.keys(groups)) {
            const items = groups[groupKey];
            const firstItem = items[0];
            const meta = firstItem._meta;
            const total = items[0]._meta.totalInstallments || items.length;

            console.log(`🔹 Processando: ${meta.baseName}`);

            let costTypeId = null;
            const typeRes = await client.query(`SELECT id FROM cost_types WHERE name = 'Financiamento' LIMIT 1`);

            if (typeRes.rows.length > 0) {
                costTypeId = typeRes.rows[0].id;
            } else {
                const typeInsert = await client.query(`
                    INSERT INTO cost_types (id, name, category, icon, color, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id
                `, [randomUUID(), 'Financiamento', 'Fixo', 'bank', 'blue', true]);
                costTypeId = typeInsert.rows[0].id;
            }

            const fixedCostId = randomUUID();
            await client.query(`
                INSERT INTO fixed_costs (id, name, valor, frequency, due_day, cost_type_id, vehicle_id, vendor, total_installments, description, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                fixedCostId,
                `Financiamento ${meta.baseName}`,
                firstItem.valor,
                'Mensal',
                new Date(firstItem.data_referencia || new Date()).getDate(),
                costTypeId,
                firstItem.vehicle_id,
                meta.baseName,
                total,
                "Migrado automaticamente de vehicle_costs",
                true
            ]);

            for (const item of items) {
                const itemMeta = item._meta;
                let status = 'Pendente';
                if (item.status === 'pago') status = 'Pago';
                if (item.status === 'atrasado') status = 'Atrasado';

                await client.query(`
                    INSERT INTO fixed_cost_installments (id, fixed_cost_id, installment_number, due_date, valor, status, paid_amount, paid_date, notes)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    randomUUID(),
                    fixedCostId,
                    itemMeta.currentInstallment,
                    new Date(item.data_referencia),
                    item.valor,
                    status,
                    item.valor_pago || null,
                    item.data_pagamento ? new Date(item.data_pagamento) : null,
                    item.observacao
                ]);
            }
        }

        console.log("🎉 Migração concluída!");
    } catch (e) {
        console.error("❌ Erro:", e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
