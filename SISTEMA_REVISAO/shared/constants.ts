/**
 * CONSTANTES GLOBAIS DO SISTEMA
 *
 * REGRA: Valores fixos que não mudam devem estar aqui
 * para evitar "magic numbers" e "magic strings" no código.
 */

// ============================================
// CONFIGURAÇÕES DE SESSÃO
// ============================================

export const SESSION_CONFIG = {
    EXPIRES_IN_HOURS: 24,
    COOKIE_NAME: "rota_verde_session",
    MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
} as const;

// ============================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================

export const SECURITY_CONFIG = {
    BCRYPT_ROUNDS: 10,
    JWT_EXPIRES_IN: "24h",
    PASSWORD_MIN_LENGTH: 8,
} as const;

// ============================================
// MENSAGENS DE ERRO PADRÃO
// ============================================

export const ERROR_MESSAGES = {
    UNAUTHORIZED: "Não autorizado. Faça login novamente.",
    INVALID_CREDENTIALS: "Email ou senha inválidos.",
    USER_NOT_FOUND: "Usuário não encontrado.",
    EMAIL_ALREADY_EXISTS: "Email já cadastrado.",
    INTERNAL_ERROR: "Erro interno do servidor.",
    VALIDATION_ERROR: "Dados inválidos.",
    SESSION_EXPIRED: "Sessão expirada. Faça login novamente.",
} as const;

// ============================================
// MENSAGENS DE SUCESSO PADRÃO
// ============================================

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Login realizado com sucesso!",
    LOGOUT_SUCCESS: "Logout realizado com sucesso!",
    USER_CREATED: "Usuário criado com sucesso!",
} as const;
