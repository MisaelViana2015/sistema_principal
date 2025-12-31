import { db } from "../../core/db/connection.js";
import { drivers, sessions } from "../../../shared/schema.js";
import { eq } from "drizzle-orm";
import { CreateDriverInput } from "./auth.validators.js";

/**
 * REPOSITORY - AUTH
 * 
 * REGRA: Repository só faz queries no banco
 * Não contém lógica de negócio
 * Não trata erros de validação
 */

/**
 * Busca driver por email
 */
export async function findDriverByEmail(email: string) {
    const result = await db
        .select({
            id: drivers.id,
            nome: drivers.nome,
            email: drivers.email,
            senha: drivers.senha,
            telefone: drivers.telefone,
            role: drivers.role,
            isActive: drivers.isActive,
            temp_password_hash: drivers.temp_password_hash,
            temp_password_expires_at: drivers.temp_password_expires_at,
            must_reset_password: drivers.must_reset_password
        })
        .from(drivers)
        .where(eq(drivers.email, email))
        .limit(1);

    return result[0] || null;
}

/**
 * Busca driver por ID
 */
export async function findDriverById(id: string) {
    const result = await db
        .select({
            id: drivers.id,
            nome: drivers.nome,
            email: drivers.email,
            senha: drivers.senha,
            telefone: drivers.telefone,
            role: drivers.role,
            isActive: drivers.isActive,
            temp_password_hash: drivers.temp_password_hash,
            temp_password_expires_at: drivers.temp_password_expires_at,
            must_reset_password: drivers.must_reset_password
        })
        .from(drivers)
        .where(eq(drivers.id, id))
        .limit(1);

    return result[0] || null;
}

/**
 * Cria novo driver
 */
export async function createDriver(data: CreateDriverInput & { senha: string }) {
    const result = await db
        .insert(drivers)
        .values({
            nome: data.nome,
            email: data.email,
            senha: data.senha, // já deve vir hasheada do service
            telefone: data.telefone,
            role: data.role || "driver",
        })
        .returning();

    return result[0];
}

/**
 * Atualiza última vez que driver fez login
 */
export async function updateLastLogin(driverId: string) {
    // Coluna updated_at removida do schema pois não existe no banco
}

export async function updateDriver(id: string, data: Partial<any>) {
    const result = await db
        .update(drivers)
        .set(data)
        .where(eq(drivers.id, id))
        .returning();
    return result[0];
}

/**
 * Busca todos os motoristas
 */
export async function findAllDrivers() {
    const result = await db
        .select()
        .from(drivers)
        .orderBy(drivers.nome);

    return result;
}

/**
 * ============== SESSÕES (REFRESH TOKEN) ==============
 */

/**
 * Cria nova sessão (Refresh Token)
 */
export async function createSession(data: {
    driverId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: string; // ISO string
}) {
    const result = await db
        .insert(sessions)
        .values({
            driverId: data.driverId,
            token: data.token, // IMPORTANTE: Hash do token se possível no futuro
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            expiresAt: data.expiresAt,
        })
        .returning();

    return result[0];
}

/**
 * Busca sessão pelo token
 */
export async function findSessionByToken(token: string) {
    const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1);

    return result[0] || null;
}

/**
 * Remove sessão pelo ID (Logout/Rotação)
 */
export async function deleteSession(sessionId: string) {
    await db
        .delete(sessions)
        .where(eq(sessions.id, sessionId));
}

/**
 * Remove todas as sessões de um usuário (Logout geral)
 */
export async function deleteSessionsByDriver(driverId: string) {
    await db
        .delete(sessions)
        .where(eq(sessions.driverId, driverId));
}
