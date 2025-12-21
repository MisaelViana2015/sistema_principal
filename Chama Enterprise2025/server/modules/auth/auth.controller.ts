import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import { loginSchema, createDriverSchema } from "./auth.validators.js";
import { SUCCESS_MESSAGES } from "../../../shared/constants.js";

/**
 * CONTROLLER - AUTH
 * 
 * REGRA: Controller é apenas ponte entre HTTP e Service
 * Recebe req/res, valida entrada, chama service, retorna resposta
 * NÃO contém lógica de negócio
 */

/**
 * POST /api/auth/login
 * Realiza login
 */
export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Valida entrada
        const credentials = loginSchema.parse(req.body);

        // Pega user agent e IP para segurança da sessão
        const userAgent = req.headers["user-agent"] || "";
        const ipAddress = req.ip || "";

        // Chama service
        const result = await authService.login(credentials, userAgent, ipAddress);

        // Define Cookie HttpOnly Seguro para o Refresh Token
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true, // Sempre secure em produção (Railway é HTTPS)
            sameSite: "none", // Necessário para cross-site/subdomains se houver
            path: "/api/auth", // Escipo restrito
            maxAge: 14 * 24 * 60 * 60 * 1000 // 14 dias
        });

        // Retorna sucesso (Apenas Access Token no JSON)
        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            data: {
                user: result.user,
                token: result.token // Access Token
            },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/refresh
 * Renova o Access Token usando o Cookie
 */
export async function refreshController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) {
            return res.status(401).json({ error: "No refresh token" });
        }

        const userAgent = req.headers["user-agent"] || "";
        const ipAddress = req.ip || "";

        const result = await authService.refreshToken(cookies.refreshToken, userAgent, ipAddress);

        // Atualiza o Cookie (Rotação)
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/auth",
            maxAge: 14 * 24 * 60 * 60 * 1000
        });

        // Retorna novo Access Token
        res.json({ token: result.accessToken });
    } catch (error) {
        // Se falhar (token inválido/expirado), limpa o cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/auth"
        });
        next(error);
    }
}

/**
 * POST /api/auth/register
 * Cria novo usuário (apenas admin pode criar)
 */
export async function registerController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Valida entrada
        const data = createDriverSchema.parse(req.body);

        // Chama service
        const newDriver = await authService.createNewDriver(data);

        // Retorna sucesso
        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_CREATED,
            data: newDriver,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
export async function getMeController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Não autenticado",
            });
        }

        // Busca dados atualizados do usuário
        const driver = await authService.getDriverById(req.user.userId);

        res.status(200).json({
            success: true,
            data: driver,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/logout
 * Logout (no JWT é apenas informativo, token expira sozinho)
 */
export async function logoutController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const cookies = req.cookies;
        if (cookies?.refreshToken) {
            await authService.logout(cookies.refreshToken);
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/api/auth"
        });

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/auth/drivers
 * Lista todos os motoristas
 */
export async function getAllDriversController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const drivers = await authService.getAllDrivers();

        res.status(200).json({
            success: true,
            data: drivers,
        });
    } catch (error) {
        next(error);
    }
}
