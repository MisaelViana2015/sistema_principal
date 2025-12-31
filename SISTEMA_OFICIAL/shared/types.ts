/**
 * TIPOS COMPARTILHADOS ENTRE CLIENT E SERVER
 * 
 * REGRA: Tipos que são usados tanto no frontend quanto no backend
 * devem estar aqui para evitar duplicação.
 */

// ============================================
// ENUMS DE SISTEMA
// ============================================

export enum UserRole {
    ADMIN = "admin",
    DRIVER = "driver",
    SUPERVISOR = "supervisor",
}

// ============================================
// TIPOS DE API RESPONSE
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface LoginResponse {
    ok: boolean;
    user?: {
        id: string;
        nome: string;
        email: string;
        role: UserRole;
    };
    token?: string;
    error?: string;
    next_action?: "RESET_PASSWORD_REQUIRED";
    password_change_token?: string;
}

// ============================================
// TIPOS DE VALIDAÇÃO
// ============================================

export interface LoginCredentials {
    email: string;
    senha: string;
}

export interface CreateDriverInput {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    role?: UserRole;
}
