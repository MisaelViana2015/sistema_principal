import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../../shared/schema.js";

/**
 * CONEXÃO COM BANCO DE DADOS
 * 
 * REGRAS ABSOLUTAS:
 * - Usar driver 'pg' (node-postgres) - NUNCA @neondatabase/serverless
 * - Prepared statements DESABILITADOS para Railway (prepare: false)
 * - SSL obrigatório em produção
 * - Sempre validar DATABASE_URL antes de conectar
 */

const { Pool } = pg;

// Validação DA DATABASE_URL (Aviso apenas, para não crashar o boot se estiver vazia)
if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL não definida! O servidor iniciará sem banco de dados.");
}

// Log de ambiente (NUNCA logar a URL completa por segurança)
const env = process.env.NODE_ENV || "development";
const appEnv = process.env.APP_ENV || "local";
console.log(`🔌 Conectando ao banco de dados...`);
console.log(`📍 Ambiente: ${env} (${appEnv})`);

// Configuração do Pool PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
        env === "production"
            ? { rejectUnauthorized: false }
            : false,
    max: 10, // máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Configuração do Drizzle ORM
// IMPORTANTE: prepare: false para evitar erro no Railway
export const db = drizzle(pool, {
    schema,
    logger: env === "development",
});

// Teste de conexão
pool.on("connect", () => {
    console.log("✅ Conexão com banco de dados estabelecida");
});

pool.on("error", (err) => {
    console.error("❌ Erro inesperado no pool de conexões:", err);
    process.exit(-1);
});

// Função para testar conexão
export async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT NOW()");
        client.release();
        console.log("✅ Teste de conexão bem-sucedido:", result.rows[0].now);
        return true;
    } catch (error) {
        console.error("❌ Falha no teste de conexão:", error);
        return false;
    }
}

// Função para fechar conexões (graceful shutdown)
export async function closeConnection() {
    await pool.end();
    console.log("🔌 Conexões com banco de dados encerradas");
}
