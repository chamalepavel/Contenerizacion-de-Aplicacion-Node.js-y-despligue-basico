const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
    try {
        // Total de usuarios
        const [usersCount] = await pool.query(
            'SELECT COUNT(*) as total FROM usuarios WHERE activo = TRUE'
        );

        // Total de eventos
        const [eventsCount] = await pool.query(
            'SELECT COUNT(*) as total FROM eventos WHERE activo = TRUE'
        );

        // Total de boletos vendidos
        const [ticketsCount] = await pool.query(
            'SELECT COUNT(*) as total FROM boletos WHERE estado IN ("pagado", "usado")'
        );

        // Ingresos totales
        const [revenue] = await pool.query(
            `SELECT SUM(monto) as total FROM transacciones WHERE estado = 'completado'`
        );

        // Eventos próximos
        const [upcomingEvents] = await pool.query(
            `SELECT COUNT(*) as total FROM eventos 
             WHERE activo = TRUE AND fecha_evento > NOW()`
        );

        // Boletos vendidos por mes (últimos 6 meses)
        const [ticketsByMonth] = await pool.query(
            `SELECT 
                DATE_FORMAT(fecha_compra, '%Y-%m') as mes,
                COUNT(*) as cantidad
             FROM boletos
             WHERE fecha_compra >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY mes
             ORDER BY mes ASC`
        );

        // Top 5 eventos más vendidos
        const [topEvents] = await pool.query(
            `SELECT 
                e.id, e.titulo, e.imagen,
                COUNT(b.id) as boletos_vendidos,
                SUM(b.precio_pagado) as ingresos
             FROM eventos e
             LEFT JOIN boletos b ON e.id = b.evento_id AND b.estado IN ('pagado', 'usado')
             WHERE e.activo = TRUE
             GROUP BY e.id
             ORDER BY boletos_vendidos DESC
             LIMIT 5`
        );

        res.json({
            success: true,
            data: {
                totalUsuarios: usersCount[0].total,
                totalEventos: eventsCount[0].total,
                totalBoletos: ticketsCount[0].total,
                ingresosTotal: revenue[0].total || 0,
                eventosProximos: upcomingEvents[0].total,
                boletosporMes: ticketsByMonth,
                topEventos: topEvents
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

// Obtener todos los usuarios con paginación
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, rol } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];

        if (search) {
            whereConditions.push('(u.nombre LIKE ? OR u.email LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (rol) {
            whereConditions.push('r.nombre = ?');
            queryParams.push(rol);
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             ${whereClause}`,
            queryParams
        );

        const total = countResult[0].total;

        const [users] = await pool.query(
            `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.created_at,
                    r.nombre as rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             ${whereClause}
             ORDER BY u.created_at DESC
             LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), offset]
        );

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

// Actualizar rol de usuario
const updateUserRole = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { userId } = req.params;
        const { rol_id } = req.body;

        // Verificar que el usuario existe
        const [users] = await pool.query(
            'SELECT id FROM usuarios WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar que el rol existe
        const [roles] = await pool.query(
            'SELECT id FROM roles WHERE id = ?',
            [rol_id]
        );

        if (roles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        await pool.query(
            'UPDATE usuarios SET rol_id = ? WHERE id = ?',
            [rol_id, userId]
        );

        res.json({
            success: true,
            message: 'Rol actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar rol',
            error: error.message
        });
    }
};

// Activar/Desactivar usuario
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const [users] = await pool.query(
            'SELECT id, activo FROM usuarios WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const newStatus = !users[0].activo;

        await pool.query(
            'UPDATE usuarios SET activo = ? WHERE id = ?',
            [newStatus, userId]
        );

        res.json({
            success: true,
            message: `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`
        });
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado del usuario',
            error: error.message
        });
    }
};

// Obtener reporte de ventas
const getSalesReport = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, evento_id } = req.query;

        let whereConditions = ["t.estado = 'completado'"];
        let queryParams = [];

        if (fecha_inicio) {
            whereConditions.push('t.created_at >= ?');
            queryParams.push(fecha_inicio);
        }

        if (fecha_fin) {
            whereConditions.push('t.created_at <= ?');
            queryParams.push(fecha_fin);
        }

        if (evento_id) {
            whereConditions.push('b.evento_id = ?');
            queryParams.push(evento_id);
        }

        const whereClause = 'WHERE ' + whereConditions.join(' AND ');

        const [sales] = await pool.query(
            `SELECT 
                e.id as evento_id,
                e.titulo as evento_titulo,
                COUNT(b.id) as boletos_vendidos,
                SUM(t.monto) as ingresos_total,
                AVG(t.monto) as precio_promedio,
                MIN(t.created_at) as primera_venta,
                MAX(t.created_at) as ultima_venta
             FROM transacciones t
             INNER JOIN boletos b ON t.boleto_id = b.id
             INNER JOIN eventos e ON b.evento_id = e.id
             ${whereClause}
             GROUP BY e.id
             ORDER BY ingresos_total DESC`,
            queryParams
        );

        // Resumen total
        const [summary] = await pool.query(
            `SELECT 
                COUNT(DISTINCT b.id) as total_boletos,
                SUM(t.monto) as ingresos_totales,
                COUNT(DISTINCT b.evento_id) as eventos_con_ventas,
                COUNT(DISTINCT b.usuario_id) as compradores_unicos
             FROM transacciones t
             INNER JOIN boletos b ON t.boleto_id = b.id
             ${whereClause}`,
            queryParams
        );

        res.json({
            success: true,
            data: {
                ventas: sales,
                resumen: summary[0]
            }
        });
    } catch (error) {
        console.error('Error al obtener reporte de ventas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de ventas',
            error: error.message
        });
    }
};

// Obtener reporte de asistentes
const getAttendeesReport = async (req, res) => {
    try {
        const { evento_id } = req.query;

        if (!evento_id) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID del evento'
            });
        }

        const [attendees] = await pool.query(
            `SELECT 
                b.id as boleto_id,
                b.codigo_boleto,
                b.estado,
                b.fecha_compra,
                b.fecha_uso,
                u.nombre as usuario_nombre,
                u.email as usuario_email,
                u.telefono as usuario_telefono
             FROM boletos b
             INNER JOIN usuarios u ON b.usuario_id = u.id
             WHERE b.evento_id = ?
             ORDER BY b.fecha_compra DESC`,
            [evento_id]
        );

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_boletos,
                SUM(CASE WHEN estado = 'usado' THEN 1 ELSE 0 END) as asistieron,
                SUM(CASE WHEN estado = 'pagado' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados
             FROM boletos
             WHERE evento_id = ?`,
            [evento_id]
        );

        res.json({
            success: true,
            data: {
                asistentes: attendees,
                estadisticas: stats[0]
            }
        });
    } catch (error) {
        console.error('Error al obtener reporte de asistentes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reporte de asistentes',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    getSalesReport,
    getAttendeesReport
};
