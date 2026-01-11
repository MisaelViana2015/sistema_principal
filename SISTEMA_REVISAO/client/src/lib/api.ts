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

// Queue para requests que falharam enquanto refresh acontecia
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Interceptor para tratar erros de autenticação (Auto Refresh)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se erro 401 e não é uma tentativa de retry e nem login
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/login")) {

            // Se o request que falhou JÁ ERA o refresh, então logout direto
            // (evita loop infinito)
            if (originalRequest.url.includes("/auth/refresh")) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Se já está rolando refresh, põe na fila
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = "Bearer " + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Tenta renovar token
                // Importante: withCredentials=true para enviar o cookie
                const { data } = await api.post("/auth/refresh");

                if (data.token) {
                    localStorage.setItem("token", data.token);
                    api.defaults.headers.common["Authorization"] = "Bearer " + data.token;

                    // Processa fila
                    processQueue(null, data.token);

                    // Retenta original
                    originalRequest.headers["Authorization"] = "Bearer " + data.token;
                    return api(originalRequest);
                }
            } catch (err) {
                // Se falhar a renovação, desloga geral
                processQueue(err, null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
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
            user?: {
                id: string;
                nome: string;
                email: string;
                role: any;
            };
            token?: string;
            ok?: boolean;
            next_action?: string;
            password_change_token?: string;
        };

        const response = await api.post<ApiResponse<LoginApiData>>(
            "/auth/login",
            { email, senha }
        );

        const data = response.data.data;

        // Check for password reset required (novo contrato)
        if (data?.next_action === "RESET_PASSWORD_REQUIRED" && data?.password_change_token) {
            return {
                ok: false,
                next_action: "RESET_PASSWORD_REQUIRED",
                password_change_token: data.password_change_token,
                error: "Troca de senha obrigatória"
            };
        }

        if (response.data.success && data?.user && data?.token) {
            // Salva token e dados do usuário
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            return {
                ok: true,
                user: data.user,
                token: data.token,
            };
        }

        return {
            ok: false,
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
