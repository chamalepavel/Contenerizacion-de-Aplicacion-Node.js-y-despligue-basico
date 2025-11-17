 Informe de Dockerización - Plataforma de Eventos
 1. Introducción

En este trabajo realicé la dockerización completa de mi proyecto de API RESTful que vengo desarrollando desde el inicio del semestre. La idea era poder empaquetar todo el sistema - tanto el backend como la base de datos - en contenedores Docker para que cualquiera pueda correr la aplicación sin tener que instalar un montón de dependencias en su computadora.

Básicamente, el objetivo era hacer que mi aplicación sea portable y fácil de desplegar, algo super útil para cuando tengas que mostrar tu proyecto a alguien más o trabajar en equipo.


 2. Aplicación Utilizada

Usé el mismo API que desarrollé en la Tarea 2 del curso. Es una plataforma completa para gestionar eventos y vender boletos, con las siguientes funcionalidades:

Características principales:
- Sistema de autenticación con JWT
- CRUD de eventos (crear, leer, actualizar, eliminar)
- Sistema de compra de tickets
- Panel administrativo con estadísticas
- Gestión de categorías
- Roles de usuario (admin, organizador, usuario normal)

La aplicación ya estaba funcionando bien en mi máquina local, pero quería poder compartirla fácilmente sin que otros tengan que configurar MySQL, instalar Node, etc.

3. Proceso de Dockerización

3.1 Creación del Dockerfile

El primer paso fue crear el Dockerfile para el backend. Después de investigar las mejores prácticas, decidí usar la imagen `node:18-alpine` porque es mucho más ligera que la imagen completa (como 40% más pequeña).

Acá está el Dockerfile que creé:

```dockerfile
# Imagen base de Node.js versión Alpine (más ligera)
FROM node:18-alpine

# Info del proyecto
LABEL maintainer="evento-platform"
LABEL description="API RESTful de Plataforma de Eventos"

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias primero
# Esto aprovecha el sistema de capas de Docker
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Crear carpeta para archivos subidos
RUN mkdir -p uploads

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Comando para iniciar la app
CMD ["node", "server.js"]
 Docker Compose

Lo más interesante del proyecto fue configurar Docker Compose para manejar tanto el backend como MySQL juntos. Esto fue un poco más complicado pero al final funcionó bien.

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: evento-platform-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: evento_platform
      MYSQL_USER: evento_user
      MYSQL_PASSWORD: evento_pass
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/database/add-indexes.sql:/docker-entrypoint-initdb.d/02-indexes.sql
    networks:
      - evento-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: evento-platform-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: root
      DB_PASSWORD: root123
      DB_NAME: evento_platform
      DB_PORT: 3306
      JWT_SECRET: tu_clave_secreta_super_segura
      NODE_ENV: production
    volumes:
      - uploads_data:/usr/src/app/uploads
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - evento-network

volumes:
  mysql_data:
  uploads_data:

networks:
  evento-network:
    driver: bridge
```

 Construcción y Ejecución

 Construcción de la Imagen

Primero tuve que actualizar el `package-lock.json` porque Docker Compose me daba un error de sincronización:

```bash
cd backend
npm install
cd ..
```

Luego construí las imágenes:

```bash
docker-compose build
```

El proceso tardó unos 8-9 segundos aproximadamente. Docker descarga la imagen de Node.js Alpine, instala las dependencias y copia el código.

**Salida del build:**
```
[+] Building 9.1s (13/13) FINISHED
 => [1/6] FROM docker.io/library/node:18-alpine
 => [2/6] WORKDIR /usr/src/app
 => [3/6] COPY package*.json ./
 => [4/6] RUN npm ci --only=production
 => [5/6] COPY . .
 => [6/6] RUN mkdir -p uploads
 => exporting to image
 => => naming to docker.io/library/evento-platform-backend:latest
```

### 4.2 Iniciando los Contenedores

Para iniciar todo usé:

```bash
docker-compose up -d
```

El flag `-d` significa "detached mode", o sea que corre en segundo plano.

**Proceso de inicio:**
```
[+] Running 4/4
 ✔ Network evento-platform_evento-network    Created
 ✔ Volume "evento-platform_mysql_data"       Created
 ✔ Volume "evento-platform_uploads_data"     Created
 ✔ Container evento-platform-mysql           Started
 ✔ Container evento-platform-backend         Started
```

Primero, Docker Compose:
1. Crea la red privada
2. Crea los volúmenes para datos persistentes
3. Inicia MySQL y espera a que esté healthy (unos 20 segundos)
4. Inicia el backend

### 4.3 Verificación del Estado

Para verificar que todo está corriendo:

```bash
docker-compose ps
```

**Resultado:**
```
NAME                      STATUS                   PORTS
evento-platform-backend   Up 3 minutes             0.0.0.0:5000->5000/tcp
evento-platform-mysql     Up 3 minutes (healthy)   0.0.0.0:3307->3306/tcp
```

Ambos contenedores están "Up" y MySQL muestra "healthy" ✓

---

## 5. Pruebas de Funcionamiento

### 5.1 Verificar Logs

Primero revisé los logs del backend para asegurarme de que se conectó bien a la BD:

```bash
docker-compose logs backend
``
```
 Conexión a la base de datos exitosa
==================================================
 Servidor corriendo en http://localhost:5000
 Ambiente: production
 Base de datos: evento_platform
==================================================

 Endpoints disponibles:
   - Auth: http://localhost:5000/api/auth
   - Events: http://localhost:5000/api/events
   - Tickets: http://localhost:5000/api/tickets
   - Categories: http://localhost:5000/api/categories
   - Admin: http://localhost:5000/api/admin
```

Perfecto! El servidor se conectó exitosamente.

### 5.2 Probar el Endpoint Principal

Probé el endpoint raíz con curl:

```bash
curl http://localhost:5000/
```

**Respuesta:**
```json
{
  "success": true,
  "message": "API de Plataforma de Eventos",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "events": "/api/events",
    "tickets": "/api/tickets",
    "categories": "/api/categories",
    "admin": "/api/admin"
  }
}
```

¡Funciona! La API responde correctamente.

### 5.3 Registrar un Usuario

Probé registrar un usuario nuevo:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dockertest",
    "email": "docker@test.com",
    "password": "Test123!",
    "full_name": "Docker Test User"
  }'
```

Si esto funciona, significa que:
- La API está corriendo ✓
- Se conecta a MySQL ✓
- Puede insertar datos en la BD ✓
- Las validaciones funcionan ✓

  Verificar la Base de Datos

También me conecté directamente a MySQL para ver las tablas:

```bash
docker exec -it evento-platform-mysql mysql -u root -proot123
```

Dentro de MySQL:
```sql
USE evento_platform;
SHOW TABLES;
```

Resultado:**
```
+---------------------------+
| Tables_in_evento_platform |
+---------------------------+
| categories                |
| events                    |
| tickets                   |
| users                     |
+---------------------------+
```

Todas las tablas se crearon correctamente con el script SQL inicial.

---

  Archivos Creados

Durante el proceso de dockerización, creé los siguientes archivos:

Archivos Docker Core:
1. **`backend/Dockerfile`** - Define cómo construir la imagen del backend
2. **`backend/.dockerignore`** - Excluye archivos innecesarios
3. **`docker-compose.yml`** - Orquesta MySQL + Backend

 Scripts de Automatización:
4. **`build-and-run.bat`** - Script para Windows que automatiza todo
5. **`build-and-run.sh`** - Script para Linux/Mac

 Documentación:
6. **`README_DOCKER.md`** - Guía completa paso a paso
7. **`INSTRUCCIONES_DESPLIEGUE.md`** - Instrucciones rápidas
8. **`DOCUMENTACION_DOCKER.md`** - Documentación técnica detallada
9. **`README.md`** (actualizado) - Agregué sección de Docker

---

 7. Comandos Útiles

Acá dejo los comandos más importantes que usé:

```bash
# Construir las imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Detener todo
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend

# Ver imágenes creadas
docker images

# Acceder al contenedor
docker exec -it evento-platform-backend sh
```

---

 Problemas Encontrados y Soluciones

 Problema 1: package-lock.json desincronizado

**Error:**
```
npm ci can only install packages when your package.json and package-lock.json are in sync
```

**Solución:**
Tuve que regenerar el package-lock.json:
```bash
cd backend
npm install
```

 Problema 2: Puerto 3306 en uso

**Error:**
```
ports are not available: listen tcp 0.0.0.0:3306: bind: Only one usage of each socket address is permitted
```

**Causa:** Ya tenía MySQL corriendo localmente en el puerto 3306.

**Solución:**
Cambié el puerto de MySQL en docker-compose.yml de 3306 a 3307:
```yaml
ports:
  - "3307:3306"
```

 Problema 3: Backend intentaba conectarse antes de que MySQL estuviera listo

**Síntoma:** El backend se reiniciaba varias veces mostrando "ECONNREFUSED".

**Solución:** 
Agregué un healthcheck a MySQL y un `depends_on` con condición:
```yaml
mysql:
  healthcheck:
    test: ["CMD", "mysqladmin", "ping"]
    interval: 10s
    retries: 5

backend:
  depends_on:
    mysql:
      condition: service_healthy
```

Esto hace que el backend espere a que MySQL esté completamente listo.

---

 Estructura Final del Proyecto

```
evento-platform/
├── backend/
│   ├── Dockerfile              ← Nuevo
│   ├── .dockerignore          ← Nuevo
│   ├── config/
│   ├── controllers/
│   ├── database/
│   │   ├── schema.sql         (usado en init)
│   │   └── add-indexes.sql    (usado en init)
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── package.json
│   ├── package-lock.json      (actualizado)
│   └── server.js
│
├── docker-compose.yml         ← Nuevo
├── build-and-run.bat         ← Nuevo
├── build-and-run.sh          ← Nuevo
├── README_DOCKER.md          ← Nuevo
├── INSTRUCCIONES_DESPLIEGUE.md ← Nuevo
├── DOCUMENTACION_DOCKER.md   ← Nuevo
└── README.md                 (actualizado)
```

--
