import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFoundHandler } from "./core/errors/errorHandler.js";
import { db } from "./core/db/connection.js";
import { sql } from "drizzle-orm";

// Importar rotas dos módulos
import authRoutes from "./modules/auth/auth.routes.js";
import vehiclesRoutes from "./modules/vehicles/vehicles.routes.js";
import shiftsRoutes from "./modules/shifts/shifts.routes.js";
import driversRoutes from "./modules/drivers/drivers.routes.js";
import ridesRoutes from "./modules/rides/rides.routes.js";
import financialRoutes from "./modules/financial/financial.routes.js";
import featuresRoutes from "./modules/config/features.routes.js";
import { apiLimiter } from "./core/middlewares/rateLimit.js";

/**
 * CONFIGURAÇÃO DO EXPRESS APP
 * 
 * REGRA: Este arquivo configura middlewares globais e rotas
 * NÃO inicia o servidor (isso é feito no index.ts)
 */

const app = express();

import helmet from "helmet";

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// Security Headers (Helmet - M2)
app.use(helmet());

// CORS - Strict Origin Check (A1)
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, origin?: boolean | string) => void) => {
        // Permitir requisições sem origin (como mobile apps ou curl) em desenvolvimento
        if (!origin && process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }

        if (process.env.NODE_ENV === "production") {
            const allowedOrigin = process.env.CORS_ORIGIN;

            // Bloqueador Crítico A1: Se a ENV não estiver definida, o servidor rejeita conexões de browser
            if (!allowedOrigin) {
                console.error("⛔ ERRO CRÍTICO: CORS_ORIGIN não definida em produção.");
                return callback(new Error("CORS_ORIGIN configuration missing on server"), false);
            }

            if (origin === allowedOrigin) {
                return callback(null, true);
            }

            console.warn(`⛔ Bloqueado pelo CORS: ${origin}`);
            return callback(new Error("Not allowed by CORS"), false);
        }

        // Desenvolvimento: Fallback seguro
        const devOrigin = "http://localhost:5173";
        if (!origin || origin === devOrigin) {
            return callback(null, true);
        }

        callback(new Error("Not allowed by CORS (Dev Mode)"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Parse JSON (Limite estrito de 100kb para segurança - ANEXO C)
app.use(express.json({ limit: "100kb" }));

// Parse URL-encoded
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Trust proxy (importante para Railway e Rate Limit)
app.set("trust proxy", 1);

// Limitador Global de API (proteção contra flooding)
// Deve vir antes das rotas de API
app.use("/api", apiLimiter);

// Log de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// ROTAS
// ============================================

// Health check (Profundo - ANEXO B1)
app.get("/health", async (req, res) => {
    try {
        // Teste de conexão real com banco
        await db.execute(sql`SELECT 1`);

        res.status(200).json({
            status: "healthy",
            db: "connected",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        });
    } catch (error) {
        console.error("❌ Health Check Failed:", error);
        res.status(503).json({
            status: "unhealthy",
            db: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

app.get("/api/health", (req, res) => {
    res.status(200).send("OK");
});

// EMERGÊNCIA: Rota Manual de Correção do Banco (Definida ANTES do frontend catch-all)

// Rotas de API

// Rotas de API
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/shifts", shiftsRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/rides", ridesRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/config/features", featuresRoutes);

import adminRoutes from "./modules/admin/admin.routes.js";
import tiresRoutes from "./modules/tires/tires.routes.js";
import adminToolsRoutes from "./routes/admin-tools.routes.js";

app.use("/api/admin", adminRoutes);
app.use("/api/tires", tiresRoutes);
app.use("/api/admin-tools", adminToolsRoutes);

// ============================================
// TRATAMENTO DE ERROS
// ============================================


// ============================================
// SERVIR FRONTEND (PRODUÇÃO)
// ============================================

// SERVIR FRONTEND: REMOVIDO
// Motivo: Arquitetura Modelo B (Frontend é um serviço separado Nginx)
// Este backend serve APENAS API.
// Rota não encontrada (deve vir antes do errorHandler)
app.use(notFoundHandler);

// Handler global de erros (deve ser o ÚLTIMO middleware)
app.use(errorHandler);

export default app;
