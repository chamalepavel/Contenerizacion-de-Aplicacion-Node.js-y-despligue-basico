# Backend - Plataforma de Eventos

API REST desarrollada con Node.js y Express para la gestión de eventos y boletos.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Roles de usuario (Usuario, Organizador, Administrador)
- ✅ CRUD completo de eventos
- ✅ Sistema de compra de boletos
- ✅ Gestión de categorías
- ✅ Panel administrativo con estadísticas
- ✅ Subida de imágenes
- ✅ Paginación y filtrado avanzado
- ✅ Validación de datos
- ✅ Manejo de errores robusto

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

## 🔧 Instalación

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
   - Copiar el archivo `.env` y ajustar las credenciales de la base de datos

4. Crear la base de datos:
```bash
mysql -u root -p < database/schema.sql
```

## 🏃 Ejecución

### Modo desarrollo (con nodemon):
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📚 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /profile` - Obtener perfil (requiere auth)
- `PUT /profile` - Actualizar perfil (requiere auth)

### Eventos (`/api/events`)
- `GET /` - Listar eventos (con paginación y filtros)
- `GET /:id` - Obtener evento por ID
- `POST /` - Crear evento (requiere rol organizador/admin)
- `PUT /:id` - Actualizar evento (requiere rol organizador/admin)
- `DELETE /:id` - Eliminar evento (requiere rol organizador/admin)

### Boletos (`/api/tickets`)
- `POST /purchase` - Comprar boleto (requiere auth)
- `GET /my-tickets` - Mis boletos (requiere auth)
- `GET /code/:codigo` - Obtener boleto por código (requiere auth)
- `DELETE /:id` - Cancelar boleto (requiere auth)
- `PUT /mark-used/:codigo` - Marcar como usado (requiere rol organizador/admin)

### Categorías (`/api/categories`)
- `GET /` - Listar categorías
- `GET /:id` - Obtener categoría por ID
- `POST /` - Crear categoría (requiere rol admin)
- `PUT /:id` - Actualizar categoría (requiere rol admin)
- `DELETE /:id` - Eliminar categoría (requiere rol admin)

### Administración (`/api/admin`)
- `GET /dashboard/stats` - Estadísticas del dashboard
- `GET /users` - Listar usuarios
- `PUT /users/:userId/role` - Actualizar rol de usuario
- `PUT /users/:userId/toggle-status` - Activar/desactivar usuario
- `GET /reports/sales` - Reporte de ventas
- `GET /reports/attendees` - Reporte de asistentes

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a rutas protegidas:

1. Iniciar sesión en `/api/auth/login`
2. Incluir el token en el header de las peticiones:
```
Authorization: Bearer <token>
```

## 👥 Roles de Usuario

1. **Usuario**: Puede comprar boletos y ver sus compras
2. **Organizador**: Puede crear y gestionar eventos
3. **Administrador**: Acceso completo al sistema

### Usuario Administrador por Defecto
- Email: `admin@evento.com`
- Password: `admin123`

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de MySQL
├── controllers/
│   ├── authController.js    # Lógica de autenticación
│   ├── eventController.js   # Lógica de eventos
│   ├── ticketController.js  # Lógica de boletos
│   ├── categoryController.js # Lógica de categorías
│   └── adminController.js   # Lógica administrativa
├── middleware/
│   ├── auth.js              # Verificación de JWT y roles
│   ├── validators.js        # Validaciones de datos
│   └── upload.js            # Configuración de Multer
├── routes/
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── ticketRoutes.js
│   ├── categoryRoutes.js
│   └── adminRoutes.js
├── database/
│   └── schema.sql           # Esquema de la base de datos
├── uploads/                 # Imágenes subidas
├── .env                     # Variables de entorno
├── server.js                # Punto de entrada
└── package.json
```

## 🛠️ Tecnologías Utilizadas

- **Express.js** - Framework web
- **MySQL2** - Cliente de base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Subida de archivos
- **Express Validator** - Validación de datos
- **CORS** - Manejo de CORS
- **Dotenv** - Variables de entorno

## 📝 Buenas Prácticas Implementadas

- ✅ Separación de responsabilidades (MVC)
- ✅ Validación de datos en todas las entradas
- ✅ Manejo de errores centralizado
- ✅ Uso de transacciones para operaciones críticas
- ✅ Protección contra SQL injection (prepared statements)
- ✅ Encriptación de contraseñas
- ✅ Tokens JWT con expiración
- ✅ Soft delete para eventos
- ✅ Índices en base de datos para mejor rendimiento
- ✅ Paginación para evitar sobrecarga

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT con expiración
- Validación de datos en todas las entradas
- Protección contra SQL injection
- CORS configurado
- Verificación de roles para rutas sensibles

## 📊 Base de Datos

El esquema incluye las siguientes tablas:
- `roles` - Roles del sistema
- `usuarios` - Información de usuarios
- `categorias` - Categorías de eventos
- `eventos` - Eventos publicados
- `boletos` - Boletos comprados
- `transacciones` - Registro de transacciones

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar que MySQL esté corriendo
- Revisar credenciales en `.env`
- Asegurarse de que la base de datos existe

### Error al subir imágenes
- Verificar permisos de escritura en carpeta `uploads`
- Revisar tamaño máximo de archivo (5MB por defecto)

## 📄 Licencia

Este proyecto es parte de un trabajo académico para Universidad Galileo.
