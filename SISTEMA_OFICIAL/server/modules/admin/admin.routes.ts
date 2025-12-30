import { Router } from "express";
import { requireAuth, requireAdmin } from "../../core/middlewares/authMiddleware.js";
import { migrationController } from "./migration.controller.js";

const router = Router();

// Rota de emergência protegida
router.get("/migrate-emergency", requireAuth, requireAdmin, migrationController.runMigration);

export default router;
