/**
 * CLASSE DE ERRO CUSTOMIZADA
 *
 * REGRA: Todos os erros do sistema devem usar esta classe
 * para padronizar respostas e facilitar debugging.
 */

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 400, isOperational: boolean = true) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Mantém o stack trace correto
        Error.captureStackTrace(this, this.constructor);

        // Define o nome da classe
        this.name = this.constructor.name;
    }
}

/**
 * ERROS PRÉ-DEFINIDOS COMUNS
 */

export class ValidationError extends AppError {
    constructor(message: string = "Dados inválidos") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Não autorizado") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Acesso negado") {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Recurso não encontrado") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflito de dados") {
        super(message, 409);
    }
}

export class InternalError extends AppError {
    constructor(message: string = "Erro interno do servidor") {
        super(message, 500, false);
    }
}
