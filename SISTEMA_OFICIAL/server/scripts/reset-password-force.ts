
import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    console.log("🔐 Resetando senha...");

    try {
        const email = 'programacao1215@hotmail.com';
        const newPassword = 'senha123'; // User's preferred old password

        // Hash the password with bcrypt (default rounds usually 10)
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await pool.query(`
            UPDATE drivers 
            SET senha = $1 
            WHERE email = $2
        `, [hashedPassword, email]);

        if (res.rowCount > 0) {
            console.log(`✅ Senha resetada para o usuário ${email}`);
            console.log(`Nova senha: ${newPassword}`);
        } else {
            console.error(`❌ Usuário ${email} não encontrado.`);
        }

    } catch (err) {
        console.error("❌ Erro ao resetar:", err);
    } finally {
        await pool.end();
    }
}

main();
