import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError.js";
import { ZodError } from "zod";

/**
 * MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS
 * 
 * REGRA: Este middleware deve ser o ÚLTIMO na cadeia do Express
 * Ele captura TODOS os erros e formata a resposta de forma padronizada.
 */

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Log do erro (em produção, usar logger adequado)
    const env = process.env.NODE_ENV || "development";

    if (env === "development") {
        console.error("❌ Erro capturado:", {
            name: err.name,
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    // Erro de validação Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: "Dados inválidos",
            details: err.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    }

    // Erro customizado da aplicação
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    // Erro desconhecido (não operacional)
    console.error("❌ ERRO NÃO TRATADO:", err);

    return res.status(500).json({
        success: false,
        error: env === "production"
            ? "Erro interno do servidor"
            : err.message,
    });
}

/**
 * MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS
 */
export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        success: false,
        error: `Rota não encontrada: ${req.method} ${req.path}`,
    });
}
