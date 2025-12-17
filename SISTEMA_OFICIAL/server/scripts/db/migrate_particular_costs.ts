
import { db } from '../../core/db/connection';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('--- Iniciando migração de Custos Particulares ---');

    // 1. Adicionar is_particular em expenses
    try {
        console.log('Adicionando coluna is_particular na tabela expenses...');
        await db.execute(sql`
            ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_particular BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Coluna is_particular adicionada.');
    } catch (error) {
        console.warn('⚠️ Erro ao adicionar is_particular (pode já existir):', error);
    }

    // 2. Adicionar total_custos_particular em shifts
    try {
        console.log('Adicionando coluna total_custos_particular na tabela shifts...');
        await db.execute(sql`
            ALTER TABLE shifts ADD COLUMN IF NOT EXISTS total_custos_particular DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('✅ Coluna total_custos_particular adicionada.');
    } catch (error) {
        console.warn('⚠️ Erro ao adicionar total_custos_particular:', error);
    }

    console.log('🏁 Migração concluída.');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Erro fatal:', err);
    process.exit(1);
});
