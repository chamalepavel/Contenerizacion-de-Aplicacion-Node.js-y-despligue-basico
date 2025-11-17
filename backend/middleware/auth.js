const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware para verificar el token JWT
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ✅ OPTIMIZACIÓN: Obtener usuario Y rol en una sola consulta
        const [users] = await pool.query(
            `SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre as rol_nombre
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ? AND u.activo = TRUE`,
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido o inactivo'
            });
        }

        // ✅ Incluir rol en req.user para evitar consulta adicional
        req.user = {
            id: users[0].id,
            email: users[0].email,
            rolId: users[0].rol_id,
            role: users[0].rol_nombre // ✅ Ya disponible
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error al verificar token',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

// Middleware para verificar roles específicos
// ✅ OPTIMIZACIÓN: Ya no necesita consultar la BD
const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // El rol ya está disponible en req.user.role desde verifyToken
            if (!req.user || !req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: 'Información de rol no disponible'
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al verificar rol',
                ...(process.env.NODE_ENV === 'development' && { error: error.message })
            });
        }
    };
};

module.exports = { verifyToken, verifyRole };
