# 🎫 Plataforma de Gestión de Eventos y Boletos

Proyecto Final - Desarrollo Web Full Stack con Node.js y React

**Universidad Galileo**  
**Curso:** Aplicación en JS  
**Instructor:** Ing. Alejandro Cordova

## 📋 Descripción del Proyecto

Plataforma web completa para la gestión de eventos y venta de boletos, desarrollada con tecnologías modernas siguiendo las mejores prácticas de desarrollo y clean code.

## ✨ Características Principales

### Frontend (React)
- ✅ Página de inicio con eventos destacados y paginación
- ✅ Búsqueda y filtrado avanzado de eventos
- ✅ Página de detalle para cada evento
- ✅ Proceso de compra de boletos
- ✅ Panel de usuario para ver boletos e historial
- ✅ Sistema de registro y login
- ✅ Panel administrativo con estadísticas
- ✅ Diseño responsive y moderno

### Backend (Node.js/Express)
- ✅ API REST completa y documentada
- ✅ Autenticación JWT con roles
- ✅ Gestión de usuarios, eventos, boletos y categorías
- ✅ Subida y manejo de imágenes
- ✅ Paginación y filtrado avanzado
- ✅ Validación de datos robusta
- ✅ Manejo de errores centralizado
- ✅ Transacciones de base de datos

### Base de Datos (MySQL)
- ✅ Esquema relacional normalizado
- ✅ Relaciones con claves foráneas
- ✅ Índices para optimización
- ✅ Datos de prueba incluidos

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2
- JWT (jsonwebtoken)
- Bcrypt
- Multer
- Express Validator
- CORS

### Frontend
- React
- React Router DOM
- Axios
- CSS3

## 📁 Estructura del Proyecto

```
evento-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ticketController.js
│   │   ├── categoryController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validators.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── adminRoutes.js
│   ├── database/
│   │   └── schema.sql
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── EventDetail.js
    │   │   ├── MyTickets.js
    │   │   └── AdminDashboard.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── config/
    │   │   └── api.js
    │   ├── App.js
    │   └── styles.css
    └── package.json
```

## 🚀 Instalación y Configuración

### Opción 1: Con Docker (Recomendado) 🐳

**La forma más rápida de ejecutar la aplicación:**

#### Prerrequisitos
- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))

#### Pasos:
1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd evento-platform
```

2. Inicia Docker Desktop

3. Ejecuta el script de despliegue:
   - **Windows:** Doble clic en `build-and-run.bat`
   - **Linux/Mac:** `./build-and-run.sh`
   
   O manualmente:
```bash
docker-compose up -d
```

4. Accede a la aplicación:
   - API: http://localhost:5000
   - Frontend: http://localhost:3000 (si está dockerizado)

5. Para detener:
```bash
docker-compose down
```

📖 **Documentación completa de Docker:**
- [README_DOCKER.md](./README_DOCKER.md) - Guía detallada
- [INSTRUCCIONES_DESPLIEGUE.md](./INSTRUCCIONES_DESPLIEGUE.md) - Pasos rápidos
- [DOCUMENTACION_DOCKER.md](./DOCUMENTACION_DOCKER.md) - Documentación técnica

---

### Opción 2: Instalación Manual

#### Prerrequisitos
- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

#### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd evento-platform
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Configurar variables de entorno en `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=evento_platform
DB_PORT=3306

JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development
```

Crear la base de datos:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en frontend (opcional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## ▶️ Ejecución

### Con Docker (Recomendado)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Manual

#### Iniciar Backend
```bash
cd backend
npm run dev
```
El servidor estará disponible en `http://localhost:5000`

#### Iniciar Frontend
```bash
cd frontend
npm start
```
La aplicación estará disponible en `http://localhost:3000`

## 👤 Credenciales de Prueba

### Usuario Administrador
- **Email:** admin@evento.com
- **Password:** admin123

## 📚 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Eventos
- `GET /api/events` - Listar eventos (con filtros y paginación)
- `GET /api/events/:id` - Obtener evento por ID
- `POST /api/events` - Crear evento (organizador/admin)
- `PUT /api/events/:id` - Actualizar evento (organizador/admin)
- `DELETE /api/events/:id` - Eliminar evento (organizador/admin)

### Boletos
- `POST /api/tickets/purchase` - Comprar boleto
- `GET /api/tickets/my-tickets` - Mis boletos
- `GET /api/tickets/code/:codigo` - Obtener boleto por código
- `DELETE /api/tickets/:id` - Cancelar boleto
- `PUT /api/tickets/mark-used/:codigo` - Marcar como usado

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría
- `POST /api/categories` - Crear categoría (admin)
- `PUT /api/categories/:id` - Actualizar categoría (admin)
- `DELETE /api/categories/:id` - Eliminar categoría (admin)

### Administración
- `GET /api/admin/dashboard/stats` - Estadísticas
- `GET /api/admin/users` - Listar usuarios
- `PUT /api/admin/users/:userId/role` - Actualizar rol
- `PUT /api/admin/users/:userId/toggle-status` - Activar/desactivar
- `GET /api/admin/reports/sales` - Reporte de ventas
- `GET /api/admin/reports/attendees` - Reporte de asistentes

## 🎯 Funcionalidades Implementadas

### Para Usuarios
- Registro y autenticación
- Búsqueda y filtrado de eventos
- Compra de boletos
- Visualización de boletos comprados
- Cancelación de boletos
- Gestión de perfil

### Para Organizadores
- Crear y gestionar eventos
- Subir imágenes de eventos
- Ver estadísticas de sus eventos

### Para Administradores
- Dashboard con estadísticas generales
- Gestión completa de usuarios
- Gestión de categorías
- Reportes de ventas y asistentes
- Control total del sistema

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación basada en JWT
- Validación de datos en todas las entradas
- Protección contra SQL injection
- Control de acceso basado en roles
- Manejo seguro de archivos subidos

## 📝 Buenas Prácticas Implementadas

- Separación de responsabilidades (MVC)
- Código limpio y bien documentado
- Manejo de errores centralizado
- Validación exhaustiva de datos
- Uso de transacciones para operaciones críticas
- Paginación para optimizar rendimiento
- Índices en base de datos
- Soft delete para mantener integridad
- Responsive design

## 🧪 Pruebas

Para probar la aplicación:

1. Registrar un nuevo usuario
2. Explorar eventos disponibles
3. Comprar boletos
4. Ver boletos en "Mis Boletos"
5. Iniciar sesión como admin para acceder al panel administrativo

## 🐳 Docker

Este proyecto está completamente dockerizado para facilitar el despliegue:

### Archivos Docker
- `backend/Dockerfile` - Imagen del backend
- `backend/.dockerignore` - Exclusiones para la imagen
- `docker-compose.yml` - Orquestación de servicios
- `build-and-run.bat` - Script automatizado para Windows
- `build-and-run.sh` - Script automatizado para Linux/Mac

### Ventajas de usar Docker
- ✅ Configuración automática de MySQL
- ✅ Sin conflictos de versiones
- ✅ Despliegue en un solo comando
- ✅ Portabilidad total
- ✅ Aislamiento de dependencias

## 📖 Documentación Adicional

- [Backend README](./backend/README.md) - Documentación detallada del backend
- [API Documentation](./backend/README.md#endpoints-de-la-api) - Endpoints y ejemplos
- [README_DOCKER.md](./README_DOCKER.md) - Guía completa de Docker
- [INSTRUCCIONES_DESPLIEGUE.md](./INSTRUCCIONES_DESPLIEGUE.md) - Instrucciones rápidas de despliegue
- [DOCUMENTACION_DOCKER.md](./DOCUMENTACION_DOCKER.md) - Documentación técnica de dockerización

## 👨‍💻 Autor

Proyecto desarrollado como trabajo final del curso de Aplicación en JS

## 📄 Licencia

Este proyecto es parte de un trabajo académico para Universidad Galileo.

## 🙏 Agradecimientos

- Ing. Alejandro Cordova - Instructor del curso
- Universidad Galileo
- Comunidad de desarrolladores

---

**Nota:** Este proyecto fue desarrollado con fines educativos siguiendo las mejores prácticas de desarrollo web full stack.
