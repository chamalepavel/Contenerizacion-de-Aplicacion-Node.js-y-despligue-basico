const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// Registrar nuevo usuario
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { nombre, email, password, telefono } = req.body;

        // Verificar si el email ya existe
        const [existingUsers] = await pool.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Obtener rol de usuario por defecto
        const [roles] = await pool.query(
            'SELECT id FROM roles WHERE nombre = ?',
            ['usuario']
        );

        const rolId = roles[0].id;

        // Insertar nuevo usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, telefono, rol_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, telefono || null, rolId]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: result.insertId,
                nombre,
                email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// Iniciar sesión
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const [users] = await pool.query(
            `SELECT u.id, u.nombre, u.email, u.password, u.rol_id, u.activo, r.nombre as rol_nombre
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                rolId: user.rol_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol_nombre
                }
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT u.id, u.nombre, u.email, u.telefono, r.nombre as rol
             FROM usuarios u
             INNER JOIN roles r ON u.rol_id = r.id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil',
            error: error.message
        });
    }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { nombre, telefono } = req.body;

        await pool.query(
            'UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?',
            [nombre, telefono || null, req.user.id]
        );

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
