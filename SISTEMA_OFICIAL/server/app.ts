import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { db } from "./core/db/connection.js";
import { sql } from "drizzle-orm";
import { errorHandler, notFoundHandler } from "./core/errors/errorHandler.js";
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

// ============================================
// MIDDLEWARES GLOBAIS
// ============================================

// CORS - permitir requisições do frontend
const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "https://rt-frontend.up.railway.app"
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

// HELMET (Security Headers)
// Configurado com CSP para permitir imagens de S3/Data e Scripts inline (se necessário)
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:", "blob:"], // Permite imagens externas HTTPS e Data URIs
                scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline pode ser necessário para scripts do Vite/React
                connectSrc: ["'self'", "https:", "wss:"], // Permite conexões WebSocket e externas
            },
        },
    })
);

app.use(cors(corsOptions));

// Parse JSON (Limite aumentado para Restore de grandes arquivos)
app.use(express.json({ limit: "50mb" }));

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
// JSON Logger Middleware (Estruturado para Railway)
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const log = {
            level: res.statusCode >= 400 ? "warn" : "info",
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        };
        // Evitar logar healthcheck para nao poluir (opcional, mas bom pra prod)
        if (req.path !== "/health" && req.path !== "/api/health") {
            console.log(JSON.stringify(log));
        }
    });
    next();
});

// ============================================
// ROTAS
// ============================================

// Health check Profundo (Deep Healthcheck)
app.get("/health", async (req, res) => {
    try {
        // Testa conexão real com query simples
        await db.execute(sql`SELECT 1`);

        res.status(200).json({
            status: "healthy",
            db: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development"
        });
    } catch (error: any) {
        console.error(JSON.stringify({
            level: "error",
            message: "Healthcheck Failed",
            error: error.message
        }));

        res.status(503).json({
            status: "unhealthy",
            db: "failed", // Isso alerta o monitoramento
            error: error.message
        });
    }
});

app.get("/api/health", (req, res) => {
    res.status(200).send("OK");
});

// EMERGÊNCIA: Rota Manual de Correção do Banco (Definida ANTES do frontend catch-all)

// FIX ENDPOINT - NO AUTH - Direct Access
app.get("/api/financial/fix-schema", async (req, res) => {
    try {
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS total_installments integer`);
        await db.execute(sql`ALTER TABLE fixed_costs ADD COLUMN IF NOT EXISTS start_date timestamp`);
        res.json({ success: true, message: "Columns total_installments and start_date added/verified." });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

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


if (process.env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Caminho para a pasta dist/client (baseado no WORKDIR /app do Docker)
    // __dirname em produção é /app/server/dist
    // Voltamos 2 niveis para /app, depois entramos em client/dist
    const clientBuildPath = path.resolve(__dirname, "../../client/dist");

    // Serve arquivos estáticos
    app.use(express.static(clientBuildPath));

    // Todas as outras rotas (SPA) retornam index.html
    // Mas ignorando rotas api que não foram tratadas (deixar cair no not found?)
    // SPA deve capturar tudo que não é /api
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }
        res.sendFile(path.join(clientBuildPath, "index.html"));
    });
}

// Rota não encontrada (deve vir antes do errorHandler)
app.use(notFoundHandler);

// Handler global de erros (deve ser o ÚLTIMO middleware)
app.use(errorHandler);

export default app;
