const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Plataforma de Eventos',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            events: '/api/events',
            tickets: '/api/tickets',
            categories: '/api/categories',
            admin: '/api/admin'
        }
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Error de Multer (subida de archivos)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'Error al subir archivo',
            error: err.message
        });
    }

    // Otros errores
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            console.log('Por favor verifica:');
            console.log('1. MySQL está corriendo');
            console.log('2. Las credenciales en el archivo .env son correctas');
            console.log('3. La base de datos "evento_platform" existe');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
            console.log('='.repeat(50));
            console.log('\n📌 Endpoints disponibles:');
            console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
            console.log(`   - Events: http://localhost:${PORT}/api/events`);
            console.log(`   - Tickets: http://localhost:${PORT}/api/tickets`);
            console.log(`   - Categories: http://localhost:${PORT}/api/categories`);
            console.log(`   - Admin: http://localhost:${PORT}/api/admin`);
            console.log('\n💡 Presiona Ctrl+C para detener el servidor\n');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
