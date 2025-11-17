# Guía de Dockerización - Plataforma de Eventos

## 📋 Tabla de Contenidos
- [Introducción](#introducción)
- [Prerrequisitos](#prerrequisitos)
- [Estructura de Archivos Docker](#estructura-de-archivos-docker)
- [Construcción de la Imagen](#construcción-de-la-imagen)
- [Ejecución del Contenedor](#ejecución-del-contenedor)
- [Uso de Docker Compose](#uso-de-docker-compose)
- [Verificación del Despliegue](#verificación-del-despliegue)
- [Comandos Útiles](#comandos-útiles)
- [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Introducción

Esta guía documenta el proceso completo de contenerización de la aplicación **Plataforma de Eventos**, una API RESTful desarrollada con Node.js, Express y MySQL. El objetivo es empaquetar la aplicación junto con todas sus dependencias en una imagen Docker portable que pueda ejecutarse de manera consistente en cualquier entorno.

### Aplicación Contenerizada
- **Backend**: API RESTful Node.js + Express
- **Base de Datos**: MySQL 8.0
- **Puerto de la API**: 5000
- **Puerto de MySQL**: 3306

---

## 📦 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
   - Descargar desde: https://www.docker.com/products/docker-desktop
   - Versión mínima recomendada: 20.10+

2. **Docker Compose**
   - Incluido en Docker Desktop
   - Para Linux: https://docs.docker.com/compose/install/

3. **Git** (opcional, para clonar el repositorio)
   ```bash
   git --version
   ```

### Verificar Instalación de Docker

```bash
# Verificar versión de Docker
docker --version

# Verificar versión de Docker Compose
docker-compose --version

# Verificar que Docker está corriendo
docker ps
```

---

## 📁 Estructura de Archivos Docker

El proyecto incluye los siguientes archivos relacionados con Docker:

```
evento-platform/
├── backend/
│   ├── Dockerfile              # Define cómo construir la imagen del backend
│   ├── .dockerignore          # Archivos a excluir de la imagen
│   ├── package.json           # Dependencias de Node.js
│   ├── server.js              # Punto de entrada de la aplicación
│   └── ...
├── docker-compose.yml         # Orquestación de múltiples contenedores
└── README_DOCKER.md          # Esta guía
```

### Descripción de Archivos Docker

#### 1. `backend/Dockerfile`
Define los pasos para construir la imagen Docker del backend:
- Imagen base: `node:18-alpine` (versión LTS de Node.js)
- Instalación de dependencias de producción
- Copia del código fuente
- Exposición del puerto 5000
- Comando de inicio de la aplicación

#### 2. `backend/.dockerignore`
Excluye archivos innecesarios de la imagen:
- node_modules (se instalarán frescos)
- Archivos .env (sensibles)
- Archivos de desarrollo y logs

#### 3. `docker-compose.yml`
Orquesta dos servicios:
- **mysql**: Base de datos MySQL 8.0
- **backend**: API Node.js

---

## 🔨 Construcción de la Imagen

### Opción 1: Construir solo el Backend

```bash
# Navegar al directorio del backend
cd backend

# Construir la imagen Docker
docker build -t evento-platform-backend:latest .

# Verificar que la imagen se creó correctamente
docker images | grep evento-platform-backend
```

**Explicación del comando:**
- `docker build`: Comando para construir una imagen
- `-t evento-platform-backend:latest`: Etiqueta (tag) para la imagen
- `.`: Contexto de construcción (directorio actual)

### Opción 2: Construir con Docker Compose (Recomendado)

```bash
# Desde el directorio raíz del proyecto
docker-compose build

# O construir sin usar caché (build limpio)
docker-compose build --no-cache
```

---

## 🚀 Ejecución del Contenedor

### Opción 1: Ejecutar solo el Backend (requiere MySQL local)

```bash
# Ejecutar el contenedor en modo detached (-d)
docker run -d \
  --name evento-platform-backend \
  -p 5000:5000 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=root \
  -e DB_PASSWORD=root123 \
  -e DB_NAME=evento_platform \
  -e DB_PORT=3306 \
  -e JWT_SECRET=tu_clave_secreta \
  -e NODE_ENV=production \
  evento-platform-backend:latest

# Ver logs del contenedor
docker logs evento-platform-backend

# Seguir logs en tiempo real
docker logs -f evento-platform-backend
```

**Nota:** `host.docker.internal` permite que el contenedor acceda a servicios en el host (MySQL local).

### Opción 2: Ejecutar con Docker Compose (Recomendado)

```bash
# Iniciar todos los servicios (MySQL + Backend)
docker-compose up -d

# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo de MySQL
docker-compose logs -f mysql
```

**Ventajas de Docker Compose:**
- ✅ Inicia MySQL y Backend automáticamente
- ✅ Crea la base de datos y ejecuta scripts SQL iniciales
- ✅ Configura la red para comunicación entre contenedores
- ✅ Gestiona volúmenes para persistencia de datos

---

## ✅ Verificación del Despliegue

### 1. Verificar que los Contenedores Están Corriendo

```bash
# Ver contenedores activos
docker-compose ps

# O con Docker nativo
docker ps
```

**Salida esperada:**
```
NAME                        STATUS          PORTS
evento-platform-backend     Up 30 seconds   0.0.0.0:5000->5000/tcp
evento-platform-mysql       Up 35 seconds   0.0.0.0:3306->3306/tcp
```

### 2. Probar el Endpoint de Bienvenida

```bash
# Usando curl (Linux/Mac/Git Bash)
curl http://localhost:5000/

# Usando PowerShell (Windows)
Invoke-WebRequest -Uri http://localhost:5000/ -UseBasicParsing
```

**Respuesta esperada:**
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

### 3. Probar Endpoints de la API

```bash
# Registrar un usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Usuario de Prueba"
  }'

# Iniciar sesión
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Listar eventos
curl http://localhost:5000/api/events
```

### 4. Verificar Conexión a la Base de Datos

```bash
# Acceder al contenedor de MySQL
docker exec -it evento-platform-mysql mysql -u root -proot123

# Dentro de MySQL, ejecutar:
USE evento_platform;
SHOW TABLES;
SELECT * FROM users;
EXIT;
```

### 5. Abrir en el Navegador

Simplemente abre tu navegador y visita:
- **API**: http://localhost:5000/
- **Endpoints disponibles**: http://localhost:5000/api/events

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (datos)
docker-compose down -v

# Reiniciar servicios
docker-compose restart

# Reiniciar solo el backend
docker-compose restart backend

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats
```

### Gestión de Imágenes

```bash
# Listar todas las imágenes
docker images

# Eliminar imagen específica
docker rmi evento-platform-backend:latest

# Eliminar imágenes no utilizadas
docker image prune -a

# Ver espacio usado por Docker
docker system df
```

### Logs y Debugging

```bash
# Ver logs de los últimos 100 líneas
docker-compose logs --tail=100

# Ver logs desde una fecha específica
docker-compose logs --since 2024-01-01

# Acceder al contenedor del backend
docker exec -it evento-platform-backend sh

# Dentro del contenedor, puedes:
ls -la                    # Ver archivos
cat server.js            # Ver contenido
env                      # Ver variables de entorno
ps aux                   # Ver procesos
exit                     # Salir
```

### Limpieza del Sistema

```bash
# Detener todos los contenedores
docker stop $(docker ps -aq)

# Eliminar todos los contenedores detenidos
docker container prune

# Eliminar todo lo no utilizado (contenedores, redes, imágenes, caché)
docker system prune -a --volumes

# Advertencia: Este comando elimina TODO
# ¡Usa con precaución!
```

---

## 🔍 Solución de Problemas

### Problema 1: El backend no se conecta a MySQL

**Síntoma:**
```
❌ No se pudo conectar a la base de datos
Error: connect ECONNREFUSED
```

**Soluciones:**

1. **Verificar que MySQL está corriendo:**
   ```bash
   docker-compose ps
   ```

2. **Esperar a que MySQL esté completamente iniciado:**
   ```bash
   docker-compose logs mysql
   # Buscar: "MySQL init process done. Ready for start up."
   ```

3. **Reiniciar el backend:**
   ```bash
   docker-compose restart backend
   ```

4. **Verificar variables de entorno:**
   ```bash
   docker exec evento-platform-backend env | grep DB_
   ```

### Problema 2: Puerto ya en uso

**Síntoma:**
```
Error: bind: address already in use
```

**Soluciones:**

1. **Detener el servicio que usa el puerto:**
   ```bash
   # Windows - PowerShell (como administrador)
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # Linux/Mac
   sudo lsof -i :5000
   kill -9 <PID>
   ```

2. **Cambiar el puerto en docker-compose.yml:**
   ```yaml
   ports:
     - "5001:5000"  # Usar puerto 5001 en el host
   ```

### Problema 3: No se aplican cambios en el código

**Síntoma:**
Los cambios en el código no se reflejan en el contenedor.

**Soluciones:**

1. **Reconstruir la imagen:**
   ```bash
   docker-compose up -d --build
   ```

2. **Reconstruir sin caché:**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Problema 4: Volúmenes con datos antiguos

**Síntoma:**
La base de datos tiene datos antiguos o corruptos.

**Soluciones:**

1. **Eliminar volúmenes y recrear:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. **Listar volúmenes:**
   ```bash
   docker volume ls
   ```

3. **Eliminar volumen específico:**
   ```bash
   docker volume rm evento-platform_mysql_data
   ```

### Problema 5: Espacio en disco insuficiente

**Síntoma:**
```
Error: no space left on device
```

**Soluciones:**

1. **Limpiar imágenes no utilizadas:**
   ```bash
   docker image prune -a
   ```

2. **Limpiar todo el sistema:**
   ```bash
   docker system prune -a --volumes
   ```

3. **Ver uso de espacio:**
   ```bash
   docker system df
   ```

---

## 🌐 Despliegue en Play With Docker

**Play With Docker** es una plataforma online gratuita para probar Docker sin instalarlo localmente.

### Pasos para Desplegar:

1. **Acceder a Play With Docker:**
   - Visita: https://labs.play-with-docker.com
   - Inicia sesión con tu cuenta de Docker Hub

2. **Crear una nueva instancia:**
   - Click en "+ ADD NEW INSTANCE"

3. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/evento-platform.git
   cd evento-platform
   ```

4. **Iniciar con Docker Compose:**
   ```bash
   docker-compose up -d
   ```

5. **Esperar a que los servicios inicien:**
   ```bash
   docker-compose logs -f
   # Presionar Ctrl+C cuando veas "Server running"
   ```

6. **Acceder a la aplicación:**
   - Play With Docker mostrará el puerto 5000 como un enlace clickeable
   - Click en el botón "5000" para abrir la API

7. **Probar la API:**
   ```bash
   curl localhost:5000
   ```

**Nota:** Las instancias de Play With Docker duran 4 horas.

---

## 📊 Arquitectura del Sistema Dockerizado

```
┌─────────────────────────────────────────────────────────────┐
│                         Host Machine                        │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Docker Compose Network                 │   │
│  │              (evento-network)                       │   │
│  │                                                     │   │
│  │  ┌──────────────────┐      ┌──────────────────┐  │   │
│  │  │  MySQL Container │      │ Backend Container│  │   │
│  │  │                  │      │                  │  │   │
│  │  │  Port: 3306      │◄────►│  Port: 5000      │  │   │
│  │  │  Image: mysql:8.0│      │  Image: node:18  │  │   │
│  │  │                  │      │                  │  │   │
│  │  │  Volume:         │      │  Volume:         │  │   │
│  │  │  mysql_data      │      │  uploads_data    │  │   │
│  │  └──────────────────┘      └──────────────────┘  │   │
│  │         ▲                           ▲            │   │
│  └─────────┼───────────────────────────┼────────────┘   │
│            │                           │                │
│     Port: 3306                  Port: 5000              │
│            │                           │                │
└────────────┼───────────────────────────┼────────────────┘
             │                           │
          localhost:3306           localhost:5000
```

---

## 📝 Notas Importantes

### Seguridad
- ⚠️ Las credenciales en `docker-compose.yml` son para desarrollo/demostración
- ⚠️ En producción, usa **Docker Secrets** o variables de entorno seguras
- ⚠️ Cambia el `JWT_SECRET` a un valor único y seguro

### Persistencia de Datos
- Los datos de MySQL se guardan en el volumen `mysql_data`
- Los archivos subidos se guardan en el volumen `uploads_data`
- Para eliminar datos, usa: `docker-compose down -v`

### Rendimiento
- La imagen usa `node:18-alpine` (versión ligera de Node.js)
- Solo se instalan dependencias de producción (`npm ci --only=production`)
- El archivo `.dockerignore` reduce el tamaño de la imagen

### Desarrollo vs Producción
- Para desarrollo: monta el código como volumen para hot-reload
- Para producción: usa la imagen construida (como está configurado)

---

## 🎓 Recursos Adicionales

- **Documentación oficial de Docker:** https://docs.docker.com
- **Docker Compose reference:** https://docs.docker.com/compose/compose-file/
- **Node.js Docker Best Practices:** https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
- **Play With Docker:** https://training.play-with-docker.com

---

## 📧 Soporte

Si encuentras problemas o tienes preguntas:
1. Revisa la sección de [Solución de Problemas](#solución-de-problemas)
2. Consulta los logs: `docker-compose logs -f`
3. Verifica el estado: `docker-compose ps`

---

**¡Felicidades! Has dockerizado exitosamente tu aplicación Node.js** 🎉
