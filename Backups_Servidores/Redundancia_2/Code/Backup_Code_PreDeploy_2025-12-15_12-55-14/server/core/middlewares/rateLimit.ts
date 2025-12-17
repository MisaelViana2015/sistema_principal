import rateLimit from "express-rate-limit";

// Limitador estrito para Login
// Objetivo: Prevenir força bruta (brute-force) em senhas
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 tentativas por IP
    message: { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
    standardHeaders: true, // Retorna info de limite nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
    skip: (req) => {
        // Opcional: pular para IPs internos ou de admins conhecidos se necessário (futuro)
        return false;
    }
});

// Limitador global para API
// Objetivo: Prevenir DoS simples e abuso de endpoints
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 240, // 240 requisições por IP (4 req/segundo sustetável)
    message: { error: "Muitas requisições. Aguarde um momento." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Importante: Pular rota de health check para não derrubar monitoramento
        if (req.path === "/health" || req.path === "/api/health") return true;
        return false;
    }
});
