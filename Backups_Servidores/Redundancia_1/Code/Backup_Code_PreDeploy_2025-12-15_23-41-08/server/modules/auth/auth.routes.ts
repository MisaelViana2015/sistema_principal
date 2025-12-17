import { Router } from "express";
import * as authController from "./auth.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
import { loginLimiter } from "../../core/middlewares/rateLimit.js";

/**
 * ROTAS - AUTH
 * 
 * REGRA: Define apenas os endpoints HTTP
 * Aplica middlewares necessários
 * Delega para controllers
 */

const router = Router();

/**
 * POST /api/auth/login
 * Login público (não precisa de autenticação)
 * Protegido por Rate Limit
 */
router.post("/login", loginLimiter, authController.loginController);

/**
 * POST /api/auth/refresh
 * Renova token JWT usando cookie HttpOnly (Rotação)
 */
router.post("/refresh", authController.refreshController);

/**
 * POST /api/auth/register
 * Criar novo usuário (APENAS ADMIN pode criar)
 */
router.post(
    "/register",
    requireAuth,
    requireAdmin,
    authController.registerController
);

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get("/me", requireAuth, authController.getMeController);

/**
 * POST /api/auth/logout
 * Logout (informativo apenas, JWT expira sozinho)
 */
router.post("/logout", requireAuth, authController.logoutController);

/**
 * GET /api/auth/drivers
 * Lista todos os motoristas (apenas admin/auth)
 */
router.get("/drivers", requireAuth, authController.getAllDriversController);

export default router;
