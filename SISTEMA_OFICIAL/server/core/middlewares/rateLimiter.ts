import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for ride creation - 10 requests per 5 minutes per user
 * This prevents abuse from multiple tabs or bots
 */
export const rideCreationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 requests per window
    message: {
        message: 'Muitas requisições. Aguarde alguns minutos antes de tentar novamente.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use userId from JWT as the key if available, otherwise use IP
    keyGenerator: (req: any) => {
        return req.user?.userId || req.ip;
    },
});

/**
 * General API limiter - 100 requests per minute per IP
 * Broad protection against DoS/abuse
 */
export const generalApiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: {
        message: 'Limite de requisições excedido. Tente novamente em instantes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
