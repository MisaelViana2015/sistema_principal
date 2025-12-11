import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFoundHandler } from "./core/errors/errorHandler.js";

// Importar rotas dos módulos
import authRoutes from "./modules/auth/auth.routes.js";
import veiculosRoutes from "./modules/veiculos/veiculos.routes.js";
import shiftsRoutes from "./modules/shifts/shifts.routes.js";
import driversRoutes from "./modules/drivers/drivers.routes.js";

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

app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// Parse URL-encoded
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Trust proxy (importante para Railway)
app.set("trust proxy", 1);

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

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Sistema Rota Verde - API funcionando",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).send("OK");
});

// Rotas de API
app.use("/api/auth", authRoutes);
app.use("/api/veiculos", veiculosRoutes);
app.use("/api/shifts", shiftsRoutes);
app.use("/api/drivers", driversRoutes);

// ============================================
// TRATAMENTO DE ERROS
// ============================================


// ============================================
// SERVIR FRONTEND (PRODUÇÃO)
// ============================================


if (process.env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Caminho para a pasta dist/client (ajustar conforme estrutura de build)
    // Se app.js está em dist/server/app.js, então ../client deve ser dist/client
    const clientBuildPath = path.join(__dirname, "../client");

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
