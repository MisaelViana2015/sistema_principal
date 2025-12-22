
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db } from '../server/core/db/connection'; // Fixed path
import { expenses, costTypes } from '../shared/schema'; // Fixed path
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

const COST_TYPE_MAP: Record<string, string> = {
    'Recarga Carro': 'edb836ed-6ffc-426f-b3d6-cb25d431f893',
    'Recarga carro': 'edb836ed-6ffc-426f-b3d6-cb25d431f893',
    'recarga carro': 'edb836ed-6ffc-426f-b3d6-cb25d431f893',

    'Pedágio': '1b3c7239-d601-4649-a3d2-cc55f41c8f6a',
    'Pedagio': '1b3c7239-d601-4649-a3d2-cc55f41c8f6a',
    'pedágio': '1b3c7239-d601-4649-a3d2-cc55f41c8f6a',

    'Recarga APP': '2c316e35-205b-4244-a2f8-7a2ea4508d43',
    'Recarga App': '2c316e35-205b-4244-a2f8-7a2ea4508d43',
    'recarga app': '2c316e35-205b-4244-a2f8-7a2ea4508d43',

    'Outros': 'b700eac7-c55d-4b2a-afc4-f19e45255a45',
    'Outro': 'b700eac7-c55d-4b2a-afc4-f19e45255a45',
    'outros': 'b700eac7-c55d-4b2a-afc4-f19e45255a45',

    'Combustível': '95dc4e6a-5474-4ba1-98d1-dc1e70e00e6b',
    'Manutenção': 'ed08c628-53b4-49a2-a088-48bc9d122ac8',
    'Alimentação': '295021de-0118-49c5-9b00-5fb6073f1f13',
    'Limpeza': '08095465-f93e-49cc-a346-60aa27c233b4'
};

async function migrate() {
    console.log('🚀 Starting Migration: Legacy Costs -> New Expenses');

    // 1. Read Backup
    const backupPath = path.resolve(__dirname, '../server/backups/legacy_backup.sql');
    if (!fs.existsSync(backupPath)) {
        console.error('❌ Backup file not found');
        process.exit(1);
    }
    const content = fs.readFileSync(backupPath, 'utf-8');

    // 2. Clear Existing Expenses (Optional - Safety Check?)
    // For now, assuming empty table as checked before.

    // 3. Parse and Insert
    // Regex: INSERT INTO public.costs VALUES ('id', 'shift_id', 'tipo', valor, 'obs', 'date', ...);
    // Since SQL dump values can vary, we'll try a regex that captures the main fields.
    // Example: ('68b1...', '...shift...', 'Recarga Carro', 50.00, NULL, '2025-12-08 17:00:00', NULL);

    const regex = /INSERT INTO public\.costs VALUES \('([^']+)', '([^']+)', '([^']+)', ([0-9.]+), (NULL|'[^']*'), '([^']+)',/g;

    let match;
    let count = 0;
    let errors = 0;

    const toInsert: any[] = [];

    while ((match = regex.exec(content)) !== null) {
        const [_, legacyId, shiftId, tipoRaw, valorStr, obsRaw, dateStr] = match;

        const tipo = tipoRaw.trim();
        const valor = valorStr;
        const notes = obsRaw === 'NULL' ? null : obsRaw.replace(/'/g, "");
        const date = dateStr;

        const costTypeId = COST_TYPE_MAP[tipo];

        if (!costTypeId) {
            console.warn(`⚠️  Unknown Cost Type: "${tipo}" - Skipping or mapping to Outros?`);
            // Map to Outros as fallback
            const fallbackId = COST_TYPE_MAP['Outros'];
            toInsert.push({
                shiftId,
                costTypeId: fallbackId,
                value: valor,
                date: new Date(date),
                notes: `[MIGRATED] Original: ${tipo}. ${notes || ''}`,
                isParticular: false  // Default
            });
        } else {
            toInsert.push({
                shiftId,
                costTypeId,
                value: valor,
                date: new Date(date),
                notes: notes ? `[MIGRATED] ${notes}` : '[MIGRATED]',
                isParticular: false
            });
        }
        count++;
    }

    console.log(`📦 Found ${toInsert.length} records to migrate.`);

    if (toInsert.length > 0) {
        // Bulk insert or loop? Loop safely.
        for (const data of toInsert) {
            try {
                await db.insert(expenses).values(data);
                process.stdout.write('.');
            } catch (e) {
                console.error(`\n❌ Error inserting record: ${(e as Error).message}`);
                errors++;
            }
        }
    }

    console.log(`\n\n✅ Migration Complete!`);
    console.log(`Total Records Processed: ${count}`);
    console.log(`Total Errors: ${errors}`);

    process.exit(0);
}

migrate().catch(console.error);
