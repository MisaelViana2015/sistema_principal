import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

async function createAdmin() {
    console.log('🔐 Criando usuário admin...\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();

        // Hash da senha
        const hashedPassword = await bcrypt.hash('admin', 10);

        // Verifica se admin já existe
        const existing = await client.query(
            'SELECT * FROM drivers WHERE email = $1',
            ['admin@rotaverde.com']
        );

        if (existing.rows.length > 0) {
            console.log('ℹ️  Admin já existe!');
            console.log(`   ID: ${existing.rows[0].id}`);
            console.log(`   Nome: ${existing.rows[0].nome}`);
            console.log(`   Email: ${existing.rows[0].email}`);
            console.log(`   Role: ${existing.rows[0].role}`);

            // Atualiza senha para 'admin'
            await client.query(
                'UPDATE drivers SET senha = $1 WHERE email = $2',
                [hashedPassword, 'admin@rotaverde.com']
            );
            console.log('\n✅ Senha atualizada para: admin');
        } else {
            // Cria novo admin
            const result = await client.query(
                `INSERT INTO drivers (nome, email, senha, role, is_active) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                ['Administrador', 'admin@rotaverde.com', hashedPassword, 'admin', true]
            );

            console.log('✅ Admin criado com sucesso!');
            console.log(`   ID: ${result.rows[0].id}`);
            console.log(`   Nome: ${result.rows[0].nome}`);
            console.log(`   Email: ${result.rows[0].email}`);
        }

        console.log('\n🔐 CREDENCIAIS DE LOGIN:');
        console.log('   Email: admin@rotaverde.com');
        console.log('   Senha: admin');
        console.log('\n⚠️  ALTERE A SENHA APÓS PRIMEIRO LOGIN!\n');

        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error.message);
        await pool.end();
        process.exit(1);
    }
}

createAdmin();
