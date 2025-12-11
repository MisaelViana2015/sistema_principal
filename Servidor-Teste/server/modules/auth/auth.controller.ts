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

        // Chama service
        const result = await authService.login(credentials);

        // Retorna sucesso
        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            data: result,
        });
    } catch (error) {
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
