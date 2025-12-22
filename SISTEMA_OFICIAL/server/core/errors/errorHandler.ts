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
        console.error(JSON.stringify({
            level: "error",
            message: "Erro capturado",
            name: err.name,
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        }));
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
    // Checagem segura de 'statusCode' para pegar erros que parecem AppError mas falharam no instanceof
    if (err instanceof AppError || (err as any).statusCode) {
        const status = (err as any).statusCode || 500;
        return res.status(status).json({
            success: false,
            error: err.message,
        });
    }

    // Erro desconhecido (não operacional)
    console.error(JSON.stringify({
        level: "critical",
        message: "ERRO NÃO TRATADO",
        error: err.message || "Erro desconhecido",
        stack: err.stack,
        type: err.constructor.name
    }));

    return res.status(500).json({
        success: false,
        // DEBUG TEMPORÁRIO: Exibir erro real em produção para diagnóstico
        error: err.message || "Erro desconhecido",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        type: err.constructor.name,
        setup_hint: "Verifique os logs do servidor para ver se o bootstrap do banco falhou."
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
