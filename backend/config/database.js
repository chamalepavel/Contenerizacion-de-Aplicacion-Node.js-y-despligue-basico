const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para verificar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos exitosa');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        return false;
    }
};

module.exports = { pool, testConnection };
