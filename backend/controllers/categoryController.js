const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(
            'SELECT * FROM categorias ORDER BY nombre ASC'
        );

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categorías',
            error: error.message
        });
    }
};

// Obtener categoría por ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const [categories] = await pool.query(
            'SELECT * FROM categorias WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.json({
            success: true,
            data: categories[0]
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener categoría',
            error: error.message
        });
    }
};

// Crear nueva categoría (solo admin)
const createCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { nombre, descripcion } = req.body;

        // Verificar si ya existe
        const [existing] = await pool.query(
            'SELECT id FROM categorias WHERE nombre = ?',
            [nombre]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || null]
        );

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: {
                id: result.insertId,
                nombre,
                descripcion
            }
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear categoría',
            error: error.message
        });
    }
};

// Actualizar categoría (solo admin)
const updateCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        // Verificar que existe
        const [categories] = await pool.query(
            'SELECT id FROM categorias WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Verificar nombre único
        const [existing] = await pool.query(
            'SELECT id FROM categorias WHERE nombre = ? AND id != ?',
            [nombre, id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe otra categoría con ese nombre'
            });
        }

        await pool.query(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion || null, id]
        );

        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar categoría',
            error: error.message
        });
    }
};

// Eliminar categoría (solo admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que existe
        const [categories] = await pool.query(
            'SELECT id FROM categorias WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Verificar que no tenga eventos asociados
        const [events] = await pool.query(
            'SELECT COUNT(*) as count FROM eventos WHERE categoria_id = ?',
            [id]
        );

        if (events[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la categoría porque tiene eventos asociados'
            });
        }

        await pool.query('DELETE FROM categorias WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar categoría',
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
