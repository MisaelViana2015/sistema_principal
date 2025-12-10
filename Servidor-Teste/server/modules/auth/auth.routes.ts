import { Router } from "express";
import * as authController from "./auth.controller.js";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";

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
 */
router.post("/login", authController.loginController);

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

export default router;
