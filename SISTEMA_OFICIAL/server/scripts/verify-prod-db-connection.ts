
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory (up one level from scripts)
dotenv.config({ path: path.join(__dirname, '../.env') });

import { db } from '../core/db/connection.js'; // Assuming it's compiled or run with tsx which handles .ts imports if extensions are managed, but let's try .js or no extension if tsx handles it. 
// Actually, with tsx I should likely refer to the source files or use extensionless imports if "moduleResolution" is node.
// Given connection.ts uses imports with .js extension in source: `import * as schema from "../../../shared/schema.js";`
// I will try to use .js extension as that seems to be the project style for ESM, even in TS.

import { rides } from '../../shared/schema.js';
import { sql } from 'drizzle-orm';

async function verify() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined');
        process.exit(1);
    }

    // Mask password for logging
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@');
    console.log(`🔌 Verifying connection to: ${maskedUrl}`);

    try {
        // Count rides
        const result = await db.select({ count: sql<number>`count(*)` }).from(rides);
        const count = Number(result[0].count);

        const message = `✅ Connection Successful! Rides: ${count}`;
        console.log(message);

        // Write to file for reliable reading
        const fs = await import('fs');
        fs.writeFileSync(path.join(__dirname, '../verification_result.txt'), message);

        if (count > 0) {
            console.log('✨ Data verification passed (Rides > 0). likely connected to PRODUCTION.');
        } else {
            console.warn('⚠️  Connected, but 0 rides found. Check if this is truly the populated production DB.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error);
        process.exit(1);
    }
}

verify();
