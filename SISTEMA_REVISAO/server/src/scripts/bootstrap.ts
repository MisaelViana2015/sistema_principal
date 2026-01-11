/**
 * BOOTSTRAP DE BANCO DE DADOS
 *
 * Este script é executado automaticamente no startup do container
 * quando a variável DB_BOOTSTRAP_TOKEN está presente.
 *
 * REGRAS:
 * - Só executa migrações que ainda não foram registradas
 * - Registra cada migração na tabela _migrations
 * - É idempotente (pode rodar várias vezes)
 * - Não expõe endpoints HTTP
 *
 * SEGURANÇA:
 * - Token temporário (definido no deploy, removido depois)
 * - Sem credenciais hardcoded
 * - Logs claros
 */

import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para log
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

async function bootstrap() {
    console.log(cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(cyan('  🚀 BOOTSTRAP DE BANCO DE DADOS'));
    console.log(cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    // Verificar token
    const dbUrl = process.env.DB_BOOTSTRAP_TOKEN || process.env.DATABASE_URL;

    if (!dbUrl) {
        console.log(yellow('[BOOTSTRAP] Nenhuma credencial encontrada. Pulando...'));
        process.exit(0);
    }

    const sql = postgres(dbUrl, { ssl: 'require' });

    try {
        // 1. Garantir que a tabela de controle existe
        await sql`
            CREATE TABLE IF NOT EXISTS _migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log(green('✓ Tabela _migrations OK'));

        // 2. Buscar migrações já executadas
        const executed = await sql`SELECT name FROM _migrations`;
        const executedNames = new Set(executed.map(r => r.name));
        console.log(`  📋 Migrações já executadas: ${executedNames.size}`);

        // 3. Listar arquivos de migração disponíveis
        const migrationsDir = path.join(__dirname, 'migrations');

        if (!fs.existsSync(migrationsDir)) {
            console.log(yellow('[BOOTSTRAP] Pasta migrations não encontrada. Pulando...'));
            await sql.end();
            process.exit(0);
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Ordenar por nome (001_, 002_, etc)

        console.log(`  📁 Arquivos de migração encontrados: ${files.length}`);

        // 4. Executar migrações pendentes
        let applied = 0;
        for (const file of files) {
            const migrationName = file.replace('.sql', '');

            if (executedNames.has(migrationName)) {
                console.log(`  ⏭️  ${migrationName} (já executada)`);
                continue;
            }

            console.log(cyan(`\n  ▶️  Executando: ${migrationName}`));

            const filePath = path.join(migrationsDir, file);
            const sqlContent = fs.readFileSync(filePath, 'utf-8');

            // Executar SQL
            await sql.unsafe(sqlContent);

            // Registrar como executada
            await sql`INSERT INTO _migrations (name) VALUES (${migrationName})`;

            console.log(green(`  ✓ ${migrationName} aplicada com sucesso`));
            applied++;
        }

        // 5. Resumo
        console.log(cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        if (applied > 0) {
            console.log(green(`  ✅ Bootstrap concluído: ${applied} migração(ões) aplicada(s)`));
        } else {
            console.log(green('  ✅ Bootstrap concluído: banco já está atualizado'));
        }
        console.log(cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        await sql.end();
        process.exit(0);

    } catch (error: any) {
        console.error(red('\n❌ ERRO NO BOOTSTRAP:'));
        console.error(red(error.message));
        console.error(error.stack);
        await sql.end();
        process.exit(1);
    }
}

bootstrap();
