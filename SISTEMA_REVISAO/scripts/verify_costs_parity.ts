
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars before other imports
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

import { db } from '../server/core/db/connection';
import { expenses, costTypes } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

async function verifyParity() {
    console.log('🔄 Starting Data Parity Check: Legacy Costs vs Current Expenses...\n');

    // 1. Analyze Legacy Backup
    const backupPath = path.resolve(__dirname, '../server/backups/legacy_backup.sql');
    if (!fs.existsSync(backupPath)) {
        console.error('❌ Legacy backup file not found at:', backupPath);
        process.exit(1);
    }

    const backupContent = fs.readFileSync(backupPath, 'utf-8');
    const legacyCosts: Record<string, { count: number; total: number }> = {};

    // Regex to match INSERT INTO public.costs
    // Format: INSERT INTO public.costs VALUES ('id', 'shift_id', 'tipo', valor, ...);
    const regex = /INSERT INTO public\.costs VALUES \('[^']+', '[^']+', '([^']+)', ([0-9.]+),/g;

    let match;
    while ((match = regex.exec(backupContent)) !== null) {
        const tipo = match[1].trim(); // Normalize whitespace
        const valor = parseFloat(match[2]);

        if (!legacyCosts[tipo]) {
            legacyCosts[tipo] = { count: 0, total: 0 };
        }
        legacyCosts[tipo].count++;
        legacyCosts[tipo].total += valor;
    }

    console.log('📊 Legacy System Data (from backup SQL):');
    console.table(
        Object.entries(legacyCosts).map(([type, data]) => ({
            Type: type,
            Count: data.count,
            Total: data.total.toFixed(2)
        })).sort((a, b) => b.Total.localeCompare(a.Total))
    );

    // Debug: Check raw count
    const rawCount = await db.execute(sql`SELECT count(*) as count FROM expenses`);
    console.log(`\n🔍 Debug: Total rows in 'expenses' table: ${rawCount.rows[0].count}`);

    // Debug: Check legacy 'costs' table in DB
    try {
        const legacyInDb = await db.execute(sql`SELECT count(*) as count, sum(valor) as total FROM costs`);
        console.log(`\n🔍 Debug: Legacy 'costs' table in DB: Count=${legacyInDb.rows[0].count}, Total=${legacyInDb.rows[0].total}`);
    } catch (e) {
        console.log(`\n🔍 Debug: Legacy 'costs' table NOT found in DB or error: ${(e as Error).message}`);
    }

    // 2. Analyze Current Database
    const currentExpenses = await db
        .select({
            type: costTypes.name,
            count: sql<number>`count(*)`,
            total: sql<number>`sum(${expenses.value})`
        })
        .from(expenses)
        .leftJoin(costTypes, eq(expenses.costTypeId, costTypes.id))
        .groupBy(costTypes.name);

    const currentData: Record<string, { count: number; total: number }> = {};
    currentExpenses.forEach(row => {
        const type = row.type || 'Unknown';
        currentData[type] = {
            count: Number(row.count),
            total: Number(row.total)
        };
    });

    console.log('\n📊 Current System Data (Database):');
    console.table(
        currentExpenses.map(row => ({
            Type: row.type,
            Count: row.count,
            Total: Number(row.total).toFixed(2)
        })).sort((a, b) => Number(b.Total) - Number(a.Total))
    );

    // 3. Comparison
    console.log('\n⚖️  Discrepancy Report:');
    const allTypes = new Set([...Object.keys(legacyCosts), ...Object.keys(currentData)]);
    const discrepancies: any[] = [];

    // Manual mapping for known renames/normalizations if any
    // Assuming strict parity implies names should match or be mapped.
    // We'll calculate totals first.

    let legacyGrandTotal = 0;
    let currentGrandTotal = 0;

    allTypes.forEach(type => {
        const legacy = legacyCosts[type] || { count: 0, total: 0 };
        const current = currentData[type] || { count: 0, total: 0 };

        legacyGrandTotal += legacy.total;
        currentGrandTotal += current.total;

        const diffCount = current.count - legacy.count;
        const diffTotal = current.total - legacy.total;

        if (diffCount !== 0 || Math.abs(diffTotal) > 0.01) {
            discrepancies.push({
                Type: type,
                'Diff Count': diffCount,
                'Diff Total': diffTotal.toFixed(2),
                'Legacy Total': legacy.total.toFixed(2),
                'Current Total': current.total.toFixed(2)
            });
        }
    });

    if (discrepancies.length > 0) {
        console.table(discrepancies);
    } else {
        console.log('✅ No discrepancies found by Category Name!');
    }

    console.log('\n💰 Financial Summary:');
    console.log(`Legacy Grand Total: R$ ${legacyGrandTotal.toFixed(2)}`);
    console.log(`Current Grand Total: R$ ${currentGrandTotal.toFixed(2)}`);

    const totalDiff = currentGrandTotal - legacyGrandTotal;
    if (Math.abs(totalDiff) < 0.1) {
        console.log('✅ GRAND TOTAL MATCHES PERFECTLY!');
    } else {
        console.log(`⚠️  Grand Total Diff: R$ ${totalDiff.toFixed(2)}`);
    }

    process.exit(0);
}

verifyParity().catch(console.error);
