import axios from "axios";
import type { LoginResponse, ApiResponse } from "../../../shared/types";

/**
 * SERVIÇO DE API - FRONTEND
 * 
 * REGRA: Centralizar todas as chamadas HTTP aqui
 * Configurar interceptors para token automático
 */

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Instância do axios
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

/**
 * SERVIÇOS DE AUTENTICAÇÃO
 */

export const authService = {
    /**
     * Realiza login
     */
    async login(email: string, senha: string): Promise<LoginResponse> {
        // Tipo esperado no data da resposta da API
        type LoginApiData = {
            user: {
                id: string;
                nome: string;
                email: string;
                role: any;
            };
            token: string;
        };

        const response = await api.post<ApiResponse<LoginApiData>>(
            "/auth/login",
            { email, senha }
        );

        if (response.data.success && response.data.data) {
            // Salva token e dados do usuário
            localStorage.setItem("token", response.data.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.data.user));

            return {
                success: true,
                user: response.data.data.user,
                token: response.data.data.token,
            };
        }

        return {
            success: false,
            error: response.data.error || "Erro ao fazer login",
        };
    },

    /**
     * Faz logout
     */
    async logout(): Promise<void> {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },

    /**
     * Busca dados do usuário autenticado
     */
    async getMe() {
        const response = await api.get("/auth/me");
        return response.data;
    },

    /**
     * Verifica se usuário está autenticado
     */
    isAuthenticated(): boolean {
        const token = localStorage.getItem("token");
        return !!token;
    },

    /**
     * Retorna dados do usuário do localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Retorna dados do usuário do localStorage (alias)
     */
    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },
};
