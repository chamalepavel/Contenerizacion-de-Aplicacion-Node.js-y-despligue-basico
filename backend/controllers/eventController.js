const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todos los eventos con paginación y filtros
const getEvents = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            categoria,
            search,
            destacado,
            fecha_desde,
            fecha_hasta,
            precio_min,
            precio_max
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['e.activo = TRUE'];
        let queryParams = [];

        // Aplicar filtros
        if (categoria) {
            whereConditions.push('e.categoria_id = ?');
            queryParams.push(categoria);
        }

        if (search) {
            whereConditions.push('(e.titulo LIKE ? OR e.descripcion LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (destacado === 'true') {
            whereConditions.push('e.destacado = TRUE');
        }

        if (fecha_desde) {
            whereConditions.push('e.fecha_evento >= ?');
            queryParams.push(fecha_desde);
        }

        if (fecha_hasta) {
            whereConditions.push('e.fecha_evento <= ?');
            queryParams.push(fecha_hasta);
        }

        if (precio_min) {
            whereConditions.push('e.precio >= ?');
            queryParams.push(precio_min);
        }

        if (precio_max) {
            whereConditions.push('e.precio <= ?');
            queryParams.push(precio_max);
        }

        const whereClause = whereConditions.length > 0 
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Contar total de eventos
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM eventos e ${whereClause}`,
            queryParams
        );

        const total = countResult[0].total;

        // Obtener eventos
        const [events] = await pool.query(
            `SELECT e.*, c.nombre as categoria_nombre, u.nombre as organizador_nombre
             FROM eventos e
             INNER JOIN categorias c ON e.categoria_id = c.id
             INNER JOIN usuarios u ON e.organizador_id = u.id
             ${whereClause}
             ORDER BY e.fecha_evento ASC
             LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), offset]
        );

        res.json({
            success: true,
            data: events,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos',
            error: error.message
        });
    }
};

// Obtener evento por ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const [events] = await pool.query(
            `SELECT e.*, c.nombre as categoria_nombre, u.nombre as organizador_nombre, u.email as organizador_email
             FROM eventos e
             INNER JOIN categorias c ON e.categoria_id = c.id
             INNER JOIN usuarios u ON e.organizador_id = u.id
             WHERE e.id = ? AND e.activo = TRUE`,
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.json({
            success: true,
            data: events[0]
        });
    } catch (error) {
        console.error('Error al obtener evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener evento',
            error: error.message
        });
    }
};

// Crear nuevo evento
const createEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            titulo,
            descripcion,
            fecha_evento,
            ubicacion,
            capacidad_total,
            precio,
            categoria_id,
            destacado
        } = req.body;

        const imagen = req.file ? req.file.filename : null;

        const [result] = await pool.query(
            `INSERT INTO eventos (titulo, descripcion, fecha_evento, ubicacion, capacidad_total, 
             boletos_disponibles, precio, categoria_id, organizador_id, imagen, destacado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                descripcion,
                fecha_evento,
                ubicacion,
                capacidad_total,
                capacidad_total,
                precio,
                categoria_id,
                req.user.id,
                imagen,
                destacado || false
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear evento',
            error: error.message
        });
    }
};

// Actualizar evento
const updateEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const {
            titulo,
            descripcion,
            fecha_evento,
            ubicacion,
            capacidad_total,
            precio,
            categoria_id,
            destacado
        } = req.body;

        // Verificar que el evento existe
        const [events] = await pool.query(
            'SELECT organizador_id FROM eventos WHERE id = ?',
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Verificar permisos (solo el organizador o admin puede editar)
        if (events[0].organizador_id !== req.user.id && req.user.role !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para editar este evento'
            });
        }

        const imagen = req.file ? req.file.filename : undefined;

        let updateQuery = `UPDATE eventos SET titulo = ?, descripcion = ?, fecha_evento = ?, 
                          ubicacion = ?, capacidad_total = ?, precio = ?, categoria_id = ?, destacado = ?`;
        let queryParams = [titulo, descripcion, fecha_evento, ubicacion, capacidad_total, precio, categoria_id, destacado || false];

        if (imagen) {
            updateQuery += ', imagen = ?';
            queryParams.push(imagen);
        }

        updateQuery += ' WHERE id = ?';
        queryParams.push(id);

        await pool.query(updateQuery, queryParams);

        res.json({
            success: true,
            message: 'Evento actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar evento',
            error: error.message
        });
    }
};

// Eliminar evento (soft delete)
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el evento existe
        const [events] = await pool.query(
            'SELECT organizador_id FROM eventos WHERE id = ?',
            [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Verificar permisos
        if (events[0].organizador_id !== req.user.id && req.user.role !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este evento'
            });
        }

        await pool.query(
            'UPDATE eventos SET activo = FALSE WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar evento',
            error: error.message
        });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
