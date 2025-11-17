const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// Generar código único para boleto
const generateTicketCode = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TICKET-${timestamp}-${randomStr}`;
};

// Comprar/Reservar boleto
const purchaseTicket = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { evento_id, cantidad = 1, metodo_pago } = req.body;

        // Verificar que el evento existe y tiene boletos disponibles
        const [events] = await connection.query(
            'SELECT id, titulo, precio, boletos_disponibles, activo FROM eventos WHERE id = ? FOR UPDATE',
            [evento_id]
        );

        if (events.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const event = events[0];

        if (!event.activo) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El evento no está activo'
            });
        }

        if (event.boletos_disponibles < cantidad) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: `Solo hay ${event.boletos_disponibles} boletos disponibles`
            });
        }

        const tickets = [];
        const totalAmount = event.precio * cantidad;

        // Crear boletos
        for (let i = 0; i < cantidad; i++) {
            const codigoBoleto = generateTicketCode();
            
            const [ticketResult] = await connection.query(
                `INSERT INTO boletos (codigo_boleto, evento_id, usuario_id, precio_pagado, estado)
                 VALUES (?, ?, ?, ?, ?)`,
                [codigoBoleto, evento_id, req.user.id, event.precio, 'pagado']
            );

            // Crear transacción
            await connection.query(
                `INSERT INTO transacciones (boleto_id, monto, metodo_pago, estado)
                 VALUES (?, ?, ?, ?)`,
                [ticketResult.insertId, event.precio, metodo_pago || 'efectivo', 'completado']
            );

            tickets.push({
                id: ticketResult.insertId,
                codigo: codigoBoleto
            });
        }

        // Actualizar boletos disponibles
        await connection.query(
            'UPDATE eventos SET boletos_disponibles = boletos_disponibles - ? WHERE id = ?',
            [cantidad, evento_id]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Compra realizada exitosamente',
            data: {
                tickets,
                total: totalAmount,
                evento: event.titulo
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al comprar boleto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la compra',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Obtener boletos del usuario
const getUserTickets = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [countResult] = await pool.query(
            'SELECT COUNT(*) as total FROM boletos WHERE usuario_id = ?',
            [req.user.id]
        );

        const total = countResult[0].total;

        const [tickets] = await pool.query(
            `SELECT b.*, e.titulo as evento_titulo, e.fecha_evento, e.ubicacion, e.imagen
             FROM boletos b
             INNER JOIN eventos e ON b.evento_id = e.id
             WHERE b.usuario_id = ?
             ORDER BY b.fecha_compra DESC
             LIMIT ? OFFSET ?`,
            [req.user.id, parseInt(limit), offset]
        );

        res.json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener boletos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener boletos',
            error: error.message
        });
    }
};

// Obtener boleto por código
const getTicketByCode = async (req, res) => {
    try {
        const { codigo } = req.params;

        const [tickets] = await pool.query(
            `SELECT b.*, e.titulo as evento_titulo, e.fecha_evento, e.ubicacion, 
                    u.nombre as usuario_nombre, u.email as usuario_email
             FROM boletos b
             INNER JOIN eventos e ON b.evento_id = e.id
             INNER JOIN usuarios u ON b.usuario_id = u.id
             WHERE b.codigo_boleto = ?`,
            [codigo]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boleto no encontrado'
            });
        }

        // Verificar que el usuario tiene acceso al boleto
        if (tickets[0].usuario_id !== req.user.id && req.user.role !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver este boleto'
            });
        }

        res.json({
            success: true,
            data: tickets[0]
        });
    } catch (error) {
        console.error('Error al obtener boleto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener boleto',
            error: error.message
        });
    }
};

// Cancelar boleto
const cancelTicket = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [tickets] = await connection.query(
            'SELECT * FROM boletos WHERE id = ? FOR UPDATE',
            [id]
        );

        if (tickets.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Boleto no encontrado'
            });
        }

        const ticket = tickets[0];

        // Verificar permisos
        if (ticket.usuario_id !== req.user.id && req.user.role !== 'administrador') {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para cancelar este boleto'
            });
        }

        if (ticket.estado === 'cancelado') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'El boleto ya está cancelado'
            });
        }

        if (ticket.estado === 'usado') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar un boleto ya usado'
            });
        }

        // Actualizar estado del boleto
        await connection.query(
            'UPDATE boletos SET estado = ? WHERE id = ?',
            ['cancelado', id]
        );

        // Devolver boleto al inventario
        await connection.query(
            'UPDATE eventos SET boletos_disponibles = boletos_disponibles + 1 WHERE id = ?',
            [ticket.evento_id]
        );

        // Actualizar transacción
        await connection.query(
            'UPDATE transacciones SET estado = ? WHERE boleto_id = ?',
            ['reembolsado', id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Boleto cancelado exitosamente'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al cancelar boleto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar boleto',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Marcar boleto como usado (para organizadores/admin)
const markTicketAsUsed = async (req, res) => {
    try {
        const { codigo } = req.params;

        const [tickets] = await pool.query(
            'SELECT * FROM boletos WHERE codigo_boleto = ?',
            [codigo]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Boleto no encontrado'
            });
        }

        const ticket = tickets[0];

        if (ticket.estado === 'usado') {
            return res.status(400).json({
                success: false,
                message: 'El boleto ya fue usado'
            });
        }

        if (ticket.estado === 'cancelado') {
            return res.status(400).json({
                success: false,
                message: 'El boleto está cancelado'
            });
        }

        await pool.query(
            'UPDATE boletos SET estado = ?, fecha_uso = NOW() WHERE id = ?',
            ['usado', ticket.id]
        );

        res.json({
            success: true,
            message: 'Boleto marcado como usado exitosamente'
        });
    } catch (error) {
        console.error('Error al marcar boleto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar boleto',
            error: error.message
        });
    }
};

module.exports = {
    purchaseTicket,
    getUserTickets,
    getTicketByCode,
    cancelTicket,
    markTicketAsUsed
};
