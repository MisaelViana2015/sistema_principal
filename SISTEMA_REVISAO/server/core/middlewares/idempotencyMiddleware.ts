import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { ConflictError } from "../errors/AppError.js";

const recentHashes = new Map<string, number>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Middleware de Idempotência (Anti-Replay)
 * Impede que a mesma requisição POST seja processada 2x em 5 minutos.
 *
 * ⚠️ NOTA DE PRODUÇÃO:
 * Esta implementação usa Map em memória e NÃO é adequada para:
 * - Múltiplas instâncias (horizontal scaling)
 * - Ambientes com restart frequente
 *
 * Para produção multi-instance, substituir por Redis ou store compartilhado.
 */
export function preventReplay(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'POST') return next();

    // Ignorar multipart (uploads) - hash do body seria custoso/impreciso
    if (req.headers['content-type']?.includes('multipart/')) return next();

    const user = (req as any).user;
    // Se não logado, usa IP? Melhor só aplicar em rotas logadas.
    const identifier = user?.userId || req.ip;

    const payload = JSON.stringify(req.body);
    const hash = crypto.createHash('sha256').update(`${identifier}-${req.path}-${payload}`).digest('hex');

    const now = Date.now();

    // Limpeza preguiçosa (probabilística)
    if (Math.random() < 0.01) {
        for (const [key, time] of recentHashes) {
            if (now - time > WINDOW_MS) recentHashes.delete(key);
        }
    }

    if (recentHashes.has(hash)) {
        const lastTime = recentHashes.get(hash)!;
        if (now - lastTime < WINDOW_MS) {
            // Replay detectado
            console.warn(`[Anti-Replay] Requisição duplicada bloqueada. Hash: ${hash}`);
            return res.status(409).json({ error: "Requisição duplicada detectada. Aguarde." });
        }
    }

    recentHashes.set(hash, now);
    next();
}
