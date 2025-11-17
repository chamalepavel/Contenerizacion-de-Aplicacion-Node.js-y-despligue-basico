const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔧 Configurando base de datos...\n');

    try {
        // Conectar sin especificar base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✅ Conectado a MySQL');

        // Crear base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'evento_platform'}`);
        await connection.query(`USE ${process.env.DB_NAME || 'evento_platform'}`);

        console.log('✅ Base de datos seleccionada');

        // Leer el archivo SQL (sin el INSERT del admin)
        const sqlPath = path.join(__dirname, 'database', 'schema.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Ejecutando script SQL...');

        // Ejecutar el script
        await connection.query(sql);

        console.log('✅ Tablas creadas');
        console.log('✅ Datos iniciales insertados');

        // ✅ CORRECCIÓN CRÍTICA: Generar hash válido para admin
        console.log('\n🔐 Generando hash seguro para administrador...');
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Verificar si ya existe el admin
        const [existingAdmin] = await connection.query(
            'SELECT id FROM usuarios WHERE email = ?',
            ['admin@evento.com']
        );

        if (existingAdmin.length === 0) {
            // Obtener ID del rol administrador
            const [roles] = await connection.query(
                'SELECT id FROM roles WHERE nombre = ?',
                ['administrador']
            );

            const adminRoleId = roles[0].id;

            // Insertar admin con hash correcto
            await connection.query(
                'INSERT INTO usuarios (nombre, email, password, telefono, rol_id) VALUES (?, ?, ?, ?, ?)',
                ['Administrador', 'admin@evento.com', hashedPassword, '12345678', adminRoleId]
            );

            console.log('✅ Usuario administrador creado con hash válido');
        } else {
            // Actualizar password del admin existente
            await connection.query(
                'UPDATE usuarios SET password = ? WHERE email = ?',
                [hashedPassword, 'admin@evento.com']
            );
            console.log('✅ Password del administrador actualizado');
        }

        console.log('\n📊 Verificando tablas...');

        // Verificar tablas creadas
        const [tables] = await connection.query(
            'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
            [process.env.DB_NAME || 'evento_platform']
        );

        console.log('\nTablas creadas:');
        tables.forEach(table => {
            console.log(`  ✓ ${table.TABLE_NAME}`);
        });

        // Verificar datos iniciales
        const [rolesData] = await connection.query('SELECT * FROM roles');
        const [categorias] = await connection.query('SELECT * FROM categorias');
        const [usuarios] = await connection.query('SELECT nombre, email, rol_id FROM usuarios');

        console.log(`\n✅ ${rolesData.length} roles creados`);
        console.log(`✅ ${categorias.length} categorías creadas`);
        console.log(`✅ ${usuarios.length} usuario(s) creado(s)`);

        if (usuarios.length > 0) {
            console.log('\n👤 Usuario administrador:');
            console.log(`   Email: admin@evento.com`);
            console.log(`   Password: admin123`);
            console.log(`   ✅ Hash generado correctamente con bcrypt`);
        }

        await connection.end();
        console.log('\n🎉 ¡Base de datos configurada correctamente!');
        console.log('\n📝 Siguiente paso: Ejecuta "npm run dev" para iniciar el servidor\n');

    } catch (error) {
        console.error('\n❌ Error al configurar la base de datos:');
        console.error(error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Asegúrate de que MySQL esté corriendo');
            console.log('   Si usas XAMPP, inicia el servicio MySQL desde el panel de control');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Verifica las credenciales en el archivo .env');
            console.log('   DB_USER y DB_PASSWORD deben ser correctos');
        }
        
        process.exit(1);
    }
}

setupDatabase();
