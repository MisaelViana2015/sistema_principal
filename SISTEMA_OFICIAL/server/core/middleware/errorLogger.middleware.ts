import { Request, Response, NextFunction } from "express";
import { auditService } from "../audit/audit.service.js";

/**
 * Middleware que captura e loga erros HTTP (4xx/5xx) para o sistema de auditoria.
 * Isso permite debugging completo sem depender de DevTools ou logs manuais.
 * 
 * IMPORTANTE: Este middleware deve ser registrado APÓS todas as rotas.
 */
export function errorLoggerMiddleware(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Determinar status code
    const statusCode = err.status || err.statusCode || res.statusCode || 500;

    // Construir detalhes do erro
    const errorDetails = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode,
        requestBody: sanitizeBody(req.body),
        requestQuery: req.query,
        requestParams: req.params,
        errorMessage: err.message || "Unknown error",
        errorName: err.name || "Error",
        errorDetails: err.details || err.errors || null, // Zod errors, validation errors
        stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
        timestamp: new Date().toISOString()
    };

    // Extrair contexto de auditoria se disponível
    const context = (req as any).auditContext || {
        userId: (req as any).user?.id || "anonymous",
        userName: (req as any).user?.nome || "Anonymous",
        role: (req as any).user?.role || "unknown",
        ip: req.ip || req.socket?.remoteAddress || "unknown",
        userAgent: req.get("user-agent") || "unknown"
    };

    // Logar assincronamente (não bloquear a response)
    setImmediate(async () => {
        try {
            await auditService.logAction({
                action: statusCode >= 500 ? "HTTP_ERROR_500" : "HTTP_ERROR_4XX",
                entity: extractEntityFromUrl(req.originalUrl || req.url),
                entityId: extractEntityIdFromUrl(req.originalUrl || req.url, req.params) || undefined,
                context,
                meta: errorDetails
            });
            console.log(`[ERROR_LOGGER] Logged ${statusCode} error for ${req.method} ${req.url}`);
        } catch (logError) {
            console.error("[ERROR_LOGGER] Failed to persist error to audit:", logError);
        }
    });

    // Continuar para o próximo handler de erro (se existir) ou enviar resposta
    if (!res.headersSent) {
        res.status(statusCode).json({
            error: err.message || "Internal Server Error",
            details: err.details || undefined,
            requestId: (req as any).requestId || undefined // Se houver request ID
        });
    }
}

/**
 * Middleware alternativo para capturar erros de forma não-invasiva.
 * Intercepta res.json() e res.send() para detectar respostas de erro.
 */
export function responseErrorCaptureMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Interceptar res.json()
    res.json = function (body: any) {
        if (res.statusCode >= 400) {
            captureErrorResponse(req, res, body);
        }
        return originalJson(body);
    };

    // Interceptar res.send() para casos onde json não é usado
    res.send = function (body: any) {
        if (res.statusCode >= 400 && typeof body === "object") {
            captureErrorResponse(req, res, body);
        }
        return originalSend(body);
    };

    next();
}

/**
 * Captura e persiste erro de resposta HTTP.
 */
function captureErrorResponse(req: Request, res: Response, responseBody: any) {
    const errorDetails = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        requestBody: sanitizeBody(req.body),
        requestQuery: req.query,
        requestParams: req.params,
        responseBody: sanitizeBody(responseBody),
        timestamp: new Date().toISOString()
    };

    const context = (req as any).auditContext || {
        userId: (req as any).user?.id || "anonymous",
        userName: (req as any).user?.nome || "Anonymous",
        role: (req as any).user?.role || "unknown",
        ip: req.ip || req.socket?.remoteAddress || "unknown",
        userAgent: req.get("user-agent") || "unknown"
    };

    // Logar assincronamente
    setImmediate(async () => {
        try {
            await auditService.logAction({
                action: res.statusCode >= 500 ? "HTTP_ERROR_500" : "HTTP_ERROR_4XX",
                entity: extractEntityFromUrl(req.originalUrl || req.url),
                entityId: extractEntityIdFromUrl(req.originalUrl || req.url, req.params) || undefined,
                context,
                meta: errorDetails
            });
            console.log(`[ERROR_LOGGER] Captured ${res.statusCode} response for ${req.method} ${req.url}`);
        } catch (logError) {
            console.error("[ERROR_LOGGER] Failed to persist error:", logError);
        }
    });
}

/**
 * Remove campos sensíveis do body para não logar senhas, tokens, etc.
 */
function sanitizeBody(body: any): any {
    if (!body || typeof body !== "object") return body;

    const sensitiveFields = ["password", "senha", "token", "accessToken", "refreshToken", "secret"];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = "[REDACTED]";
        }
    }

    return sanitized;
}

/**
 * Extrai a entidade da URL (ex: /api/financial/expenses -> expenses)
 */
function extractEntityFromUrl(url: string): string {
    const parts = url.split("/").filter(Boolean);
    // Remove 'api' prefix if present
    if (parts[0] === "api") parts.shift();
    // Return last segment before any ID
    return parts[parts.length - 1]?.split("?")[0] || "unknown";
}

/**
 * Extrai ID da entidade dos params ou da URL
 */
function extractEntityIdFromUrl(url: string, params: any): string | null {
    // Primeiro tentar params nomeados
    if (params.id) return params.id;
    if (params.shiftId) return params.shiftId;
    if (params.driverId) return params.driverId;

    // Tentar extrair UUID da URL
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : null;
}
