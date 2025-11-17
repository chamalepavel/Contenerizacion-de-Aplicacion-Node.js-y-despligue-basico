const rateLimit = require('express-rate-limit');

// Rate limiter para login - Previene ataques de fuerza bruta
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por ventana
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    skipSuccessfulRequests: false, // Cuenta todos los requests
    skipFailedRequests: false
});

// Rate limiter para registro - Previene spam de cuentas
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // 3 registros por hora por IP
    message: {
        success: false,
        message: 'Demasiados registros desde esta IP. Por favor, intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter general para API - Previene DDoS
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP. Por favor, intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // No aplicar rate limit a rutas públicas de solo lectura
        return req.method === 'GET' && req.path.startsWith('/api/events');
    }
});

// Rate limiter estricto para operaciones sensibles
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // 10 requests por hora
    message: {
        success: false,
        message: 'Límite de solicitudes excedido para esta operación.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiter para compra de boletos - Previene bots
const purchaseLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 compras por 5 minutos
    message: {
        success: false,
        message: 'Demasiadas compras en poco tiempo. Por favor, espera unos minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    registerLimiter,
    apiLimiter,
    strictLimiter,
    purchaseLimiter
};
