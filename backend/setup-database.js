const mysql = require('mysql2/promise');
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

        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'database', 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Ejecutando script SQL...');

        // Ejecutar el script
        await connection.query(sql);

        console.log('✅ Base de datos creada exitosamente');
        console.log('✅ Tablas creadas');
        console.log('✅ Datos iniciales insertados');
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
        await connection.query(`USE ${process.env.DB_NAME || 'evento_platform'}`);
        
        const [roles] = await connection.query('SELECT * FROM roles');
        const [categorias] = await connection.query('SELECT * FROM categorias');
        const [usuarios] = await connection.query('SELECT nombre, email, rol_id FROM usuarios');

        console.log(`\n✅ ${roles.length} roles creados`);
        console.log(`✅ ${categorias.length} categorías creadas`);
        console.log(`✅ ${usuarios.length} usuario(s) creado(s)`);

        if (usuarios.length > 0) {
            console.log('\n👤 Usuario administrador:');
            console.log(`   Email: ${usuarios[0].email}`);
            console.log(`   Password: admin123`);
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
