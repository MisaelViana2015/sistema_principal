import { db } from "../../core/db/connection.js";
import { drivers } from "../../../shared/schema.js";
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
        .select()
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
        .select()
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
    /*await db
        .update(drivers)
        .set({ updated_at: new Date() })
        .where(eq(drivers.id, driverId));*/
}
