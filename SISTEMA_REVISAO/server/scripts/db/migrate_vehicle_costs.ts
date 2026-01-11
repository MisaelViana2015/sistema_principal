```javascript
import "dotenv/config";
import pg from "pg";
import { randomUUID } from 'crypto';

const { Pool } = pg;

// Use pool for raw query on legacy table
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log("🚀 Iniciando migração de Vehicle Costs -> Fixed Costs...");

    try {
        // 1. Buscar todos os custos de veículo "Prestação"
        const result = await pool.query(`
SELECT * FROM vehicle_costs
            WHERE tipo ILIKE '%Prestação%'
            ORDER BY data_referencia ASC
        `);

        const rawCosts = result.rows;
        console.log(`📊 Encontrados ${ rawCosts.length } registros de prestação / financiamento.`);

        if (rawCosts.length === 0) {
            console.log("✅ Nada a migrar.");
            process.exit(0);
        }

        // 2. Agrupar por "Descrição Base" (ex: "Santander")
        // Remove "(x/y)" para achar o nome base
        const groups = {};

        for (const cost of rawCosts) {
            // Regex to extract base name "Santander" from "Santander (1/60)"
            const match = cost.descricao.match(/^(.*?)\s*\((\d+)\/(\d+)\)$/);

            let baseName = cost.descricao;
            let currentInstallment = 1;
            let totalInstallments = 1;

            if (match) {
                baseName = match[1].trim();
                currentInstallment = parseInt(match[2]);
                totalInstallments = parseInt(match[3]);
            }

            const key = `${ baseName }_${ cost.vehicle_id } `; // Group by name AND vehicle

            if (!groups[key]) {
                groups[key] = [];
            }
            // Store metadata with item
            cost._meta = {
                baseName,
                currentInstallment,
                totalInstallments
            };
            groups[key].push(cost);
        }

        console.log(`📦 Grupos identificados: ${ Object.keys(groups).length } `);

        // 3. Processar cada grupo
        for (const groupKey of Object.keys(groups)) {
            const items = groups[groupKey];
            const firstItem = items[0];
            const meta = firstItem._meta;

            console.log(`\n🔹 Processando grupo: ${ meta.baseName } (Veículo: ${ firstItem.vehicle_id })`);

            // Check if Cost Type exists
            let costTypeId = null;
            const typeRes = await pool.query(`SELECT id FROM cost_types WHERE name = 'Financiamento' LIMIT 1`);

            if (typeRes.rows.length > 0) {
                costTypeId = typeRes.rows[0].id;
            } else {
                // Create basic type if missing
                const typeInsert = await pool.query(`
                    INSERT INTO cost_types(id, name, category, icon, color, is_active)
VALUES($1, $2, $3, $4, $5, $6)
                    RETURNING id
    `, [randomUUID(), 'Financiamento', 'Fixo', 'bank', 'blue', true]);
                costTypeId = typeInsert.rows[0].id;
            }

            // Create Parent Fixed Cost
            const fixedCostId = randomUUID();
            await pool.query(`
                INSERT INTO fixed_costs(id, name, valor, frequency, due_day, cost_type_id, vehicle_id, vendor, total_installments, description, is_active)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                fixedCostId,
                `Financiamento ${ meta.baseName } `,
                firstItem.valor, // Valor da parcela
                'Mensal',
                new Date(firstItem.data_referencia || new Date()).getDate(),
                costTypeId,
                firstItem.vehicle_id,
                meta.baseName,
                items[0]._meta.totalInstallments || items.length,
                "Migrado automaticamente de vehicle_costs",
                true
            ]);

            console.log(`✅ Fixed Cost criado: ${ fixedCostId } `);

            // Create Installments
            let installmentsCreated = 0;
            for (const item of items) {
                const itemMeta = item._meta;

                // Map status
                let status = 'Pendente';
                if (item.status === 'pago') status = 'Pago';
                if (item.status === 'atrasado') status = 'Atrasado';

                await pool.query(`
                    INSERT INTO fixed_cost_installments(id, fixed_cost_id, installment_number, due_date, valor, status, paid_amount, paid_date, notes)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    randomUUID(),
                    fixedCostId,
                    itemMeta.currentInstallment,
                    new Date(item.data_referencia), // Using reference date as due date
                    item.valor,
                    status,
                    item.valor_pago || null,
                    item.data_pagamento ? new Date(item.data_pagamento) : null,
                    item.observacao
                ]);
                installmentsCreated++;
            }
            console.log(`   ↳ ${ installmentsCreated } parcelas vinculadas.`);
        }

        console.log("\n🎉 Migração concluída com sucesso!");
        process.exit(0);

    } catch (e) {
        console.error("❌ Erro na migração:", e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
