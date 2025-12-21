"use strict";
/**
 * CONSTANTES GLOBAIS DO SISTEMA
 *
 * REGRA: Valores fixos que não mudam devem estar aqui
 * para evitar "magic numbers" e "magic strings" no código.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUCCESS_MESSAGES = exports.ERROR_MESSAGES = exports.SECURITY_CONFIG = exports.SESSION_CONFIG = void 0;
// ============================================
// CONFIGURAÇÕES DE SESSÃO
// ============================================
exports.SESSION_CONFIG = {
    EXPIRES_IN_HOURS: 24,
    COOKIE_NAME: "rota_verde_session",
    MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
};
// ============================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================
exports.SECURITY_CONFIG = {
    BCRYPT_ROUNDS: 10,
    JWT_EXPIRES_IN: "24h",
    PASSWORD_MIN_LENGTH: 5,
};
// ============================================
// MENSAGENS DE ERRO PADRÃO
// ============================================
exports.ERROR_MESSAGES = {
    UNAUTHORIZED: "Não autorizado. Faça login novamente.",
    INVALID_CREDENTIALS: "Email ou senha inválidos.",
    USER_NOT_FOUND: "Usuário não encontrado.",
    EMAIL_ALREADY_EXISTS: "Email já cadastrado.",
    INTERNAL_ERROR: "Erro interno do servidor.",
    VALIDATION_ERROR: "Dados inválidos.",
    SESSION_EXPIRED: "Sessão expirada. Faça login novamente.",
};
// ============================================
// MENSAGENS DE SUCESSO PADRÃO
// ============================================
exports.SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Login realizado com sucesso!",
    LOGOUT_SUCCESS: "Logout realizado com sucesso!",
    USER_CREATED: "Usuário criado com sucesso!",
};
