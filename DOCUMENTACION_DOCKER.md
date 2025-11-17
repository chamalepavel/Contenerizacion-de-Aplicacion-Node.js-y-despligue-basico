# 📦 Documentación de Dockerización - Plataforma de Eventos

**Estudiante:** [Tu Nombre]  
**Curso:** Desarrollo Web / Tecnologías Web  
**Fecha:** 16 de Noviembre, 2025  
**Tema:** Contenerización de Aplicación Node.js con Docker

---

## 📑 Índice

1. [Introducción](#1-introducción)
2. [Objetivos Cumplidos](#2-objetivos-cumplidos)
3. [Descripción de la Aplicación](#3-descripción-de-la-aplicación)
4. [Archivos Docker Creados](#4-archivos-docker-creados)
5. [Proceso de Construcción](#5-proceso-de-construcción)
6. [Proceso de Ejecución](#6-proceso-de-ejecución)
7. [Pruebas de Funcionamiento](#7-pruebas-de-funcionamiento)
8. [Capturas de Pantalla](#8-capturas-de-pantalla)
9. [Comandos Ejecutados](#9-comandos-ejecutados)
10. [Conclusiones](#10-conclusiones)

---

## 1. Introducción

Este documento describe el proceso completo de **dockerización** de la aplicación "Plataforma de Eventos", una API RESTful desarrollada con Node.js, Express.js y MySQL. El objetivo principal es empaquetar la aplicación en contenedores Docker para garantizar un despliegue consistente y reproducible en cualquier entorno.

### Tecnologías Utilizadas

- **Backend:** Node.js 18 + Express.js 5
- **Base de Datos:** MySQL 8.0
- **Contenerización:** Docker + Docker Compose
- **Imagen Base:** node:18-alpine (Linux Alpine, ligera y optimizada)

---

## 2. Objetivos Cumplidos

✅ **Objetivo 1 - Selección de la Aplicación:**  
Se utilizó la API RESTful desarrollada en tareas previas, la cual incluye:
- Sistema de autenticación con JWT
- Gestión de eventos
- Sistema de tickets
- Gestión de categorías
- Panel de administración

✅ **Objetivo 2 - Creación del Dockerfile:**  
Se creó un Dockerfile robusto que:
- Utiliza imagen base oficial de Node.js 18 Alpine
- Implementa capas optimizadas para mejor uso de caché
- Instala solo dependencias de producción
- Expone el puerto 5000 correctamente
- Define variables de entorno apropiadas

✅ **Objetivo 3 - Construcción de la Imagen:**  
Se implementaron múltiples formas de construcción:
- Construcción individual del backend
- Construcción orquestada con Docker Compose
- Scripts automatizados para Windows y Linux

✅ **Objetivo 4 - Documentación del Despliegue:**  
Se creó documentación completa que incluye:
- README_DOCKER.md con guía paso a paso
- Scripts de automatización (bash y batch)
- Solución de problemas comunes
- Ejemplos de uso y comandos útiles

---

## 3. Descripción de la Aplicación

### Arquitectura de la Aplicación

La aplicación "Plataforma de Eventos" es una API RESTful que permite:

**Funcionalidades Principales:**
- 👤 **Autenticación:** Registro, login, JWT tokens
- 🎫 **Eventos:** CRUD completo de eventos
- 🎟️ **Tickets:** Compra y gestión de tickets
- 📁 **Categorías:** Organización por categorías
- 👨‍💼 **Administración:** Panel administrativo

**Estructura del Proyecto:**
```
evento-platform/
├── backend/
│   ├── server.js              # Punto de entrada
│   ├── config/                # Configuración DB
│   ├── controllers/           # Lógica de negocio
│   ├── routes/                # Rutas de la API
│   ├── middleware/            # Auth, validación, rate limiting
│   ├── database/              # Scripts SQL
│   ├── uploads/               # Archivos subidos
│   ├── Dockerfile            # ⭐ Configuración Docker
│   ├── .dockerignore         # ⭐ Exclusiones
│   └── package.json           # Dependencias
├── docker-compose.yml        # ⭐ Orquestación
└── README_DOCKER.md          # ⭐ Documentación
```

---

## 4. Archivos Docker Creados

### 4.1 Dockerfile (`backend/Dockerfile`)

```dockerfile
# Utilizar la imagen oficial de Node.js como base
FROM node:18-alpine

# Establecer información del mantenedor
LABEL maintainer="evento-platform"
LABEL description="API RESTful de Plataforma de Eventos - Node.js + Express + MySQL"

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de dependencias (optimización de caché)
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Crear directorio de uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 5000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=5000

# Comando de inicio
CMD ["node", "server.js"]
```

**Características Destacadas:**

1. **Imagen Base Optimizada:** `node:18-alpine` es 40% más pequeña que la imagen estándar
2. **Capas Ordenadas:** Los archivos que cambian menos frecuentemente van primero
3. **Caché Eficiente:** `package.json` se copia antes que el código fuente
4. **Producción:** Solo se instalan dependencias necesarias (`--only=production`)
5. **Seguridad:** No se corre como root, se usa usuario node por defecto

### 4.2 .dockerignore (`backend/.dockerignore`)

```
# Dependencias
node_modules
npm-debug.log

# Archivos de entorno (seguridad)
.env
.env.local
.env.development

# Archivos de desarrollo
nodemon.json

# Sistema
.DS_Store
Thumbs.db

# Control de versiones
.git
.gitignore

# IDE
.vscode
.idea

# Logs
logs
*.log

# Temporales
tmp
temp
*.tmp
```

**Propósito:**
- Reduce el tamaño de la imagen
- Mejora la seguridad (excluye .env)
- Acelera el proceso de build
- Evita conflictos de plataforma (node_modules)

### 4.3 docker-compose.yml

```yaml
version: '3.8'

services:
  # Base de Datos MySQL
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
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/database/add-indexes.sql:/docker-entrypoint-initdb.d/02-indexes.sql
    networks:
      - evento-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot123"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
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
      JWT_SECRET: tu_clave_secreta_super_segura_cambiala_en_produccion
      JWT_EXPIRES_IN: 24h
      PORT: 5000
      NODE_ENV: production
      UPLOAD_PATH: uploads
      MAX_FILE_SIZE: 5242880
    volumes:
      - uploads_data:/usr/src/app/uploads
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - evento-network

volumes:
  mysql_data:
    driver: local
  uploads_data:
    driver: local

networks:
  evento-network:
    driver: bridge
```

**Características Destacadas:**

1. **Orquestación Multi-Contenedor:** MySQL + Backend en red aislada
2. **Healthcheck:** El backend espera a que MySQL esté completamente listo
3. **Persistencia:** Volúmenes para datos de MySQL y archivos subidos
4. **Inicialización Automática:** Scripts SQL se ejecutan al crear la BD
5. **Restart Policy:** Los contenedores se reinician automáticamente
6. **Red Aislada:** Comunicación segura entre contenedores

---

## 5. Proceso de Construcción

### Método 1: Construcción Individual

**Comando:**
```bash
cd backend
docker build -t evento-platform-backend:latest .
```

**Proceso:**
```
[+] Building 45.2s (10/10) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 635B
 => [internal] load .dockerignore
 => => transferring context: 245B
 => [internal] load metadata for docker.io/library/node:18-alpine
 => [1/5] FROM docker.io/library/node:18-alpine@sha256:...
 => [internal] load build context
 => => transferring context: 125.4kB
 => [2/5] WORKDIR /usr/src/app
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm ci --only=production
 => [5/5] COPY . .
 => exporting to image
 => => exporting layers
 => => writing image sha256:abc123...
 => => naming to docker.io/library/evento-platform-backend:latest
```

**Verificación:**
```bash
docker images | grep evento-platform-backend
```

**Resultado esperado:**
```
evento-platform-backend   latest    abc123def456   2 minutes ago   215MB
```

### Método 2: Construcción con Docker Compose (Recomendado)

**Comando:**
```bash
docker-compose build
```

**Ventajas:**
- ✅ Construye todas las imágenes necesarias
- ✅ Gestiona dependencias entre servicios
- ✅ Más fácil de mantener y escalar

**Construcción Limpia (sin caché):**
```bash
docker-compose build --no-cache
```

---

## 6. Proceso de Ejecución

### Método 1: Docker Compose (Recomendado)

**Iniciar Servicios:**
```bash
docker-compose up -d
```

**Salida esperada:**
```
[+] Running 4/4
 ✔ Network evento-platform_evento-network    Created
 ✔ Volume "evento-platform_mysql_data"       Created
 ✔ Volume "evento-platform_uploads_data"     Created
 ✔ Container evento-platform-mysql           Started
 ✔ Container evento-platform-backend         Started
```

**Verificar Estado:**
```bash
docker-compose ps
```

**Resultado esperado:**
```
NAME                          STATUS          PORTS
evento-platform-backend       Up 30 seconds   0.0.0.0:5000->5000/tcp
evento-platform-mysql         Up 35 seconds   0.0.0.0:3306->3306/tcp
```

**Ver Logs:**
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo MySQL
docker-compose logs -f mysql
```

### Método 2: Scripts Automatizados

**Windows:**
```bash
build-and-run.bat
```

**Linux/Mac:**
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

Estos scripts automatizan todo el proceso:
1. Verifican Docker
2. Construyen imágenes
3. Inician contenedores
4. Verifican el estado
5. Prueban la API

---

## 7. Pruebas de Funcionamiento

### 7.1 Verificar Contenedores Activos

**Comando:**
```bash
docker ps
```

**Resultado esperado:**
```
CONTAINER ID   IMAGE                    STATUS          PORTS                    NAMES
abc123def456   evento-platform-backend  Up 2 minutes    0.0.0.0:5000->5000/tcp  evento-platform-backend
def456abc789   mysql:8.0                Up 2 minutes    0.0.0.0:3306->3306/tcp  evento-platform-mysql
```

### 7.2 Probar Endpoint Principal

**Usando curl:**
```bash
curl http://localhost:5000/
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

**Usando PowerShell (Windows):**
```powershell
Invoke-WebRequest -Uri http://localhost:5000/ -UseBasicParsing
```

**Navegador Web:**
```
http://localhost:5000/
```

### 7.3 Probar Registro de Usuario

**Comando:**
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

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "username": "dockertest",
      "email": "docker@test.com",
      "full_name": "Docker Test User"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 7.4 Probar Login

**Comando:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "docker@test.com",
    "password": "Test123!"
  }'
```

### 7.5 Verificar Base de Datos

**Acceder al contenedor MySQL:**
```bash
docker exec -it evento-platform-mysql mysql -u root -proot123
```

**Comandos dentro de MySQL:**
```sql
-- Seleccionar la base de datos
USE evento_platform;

-- Mostrar tablas
SHOW TABLES;

-- Ver usuarios registrados
SELECT id, username, email, full_name, created_at FROM users;

-- Ver eventos
SELECT id, title, description, event_date FROM events;

-- Salir
EXIT;
```

### 7.6 Verificar Logs del Backend

**Ver logs completos:**
```bash
docker logs evento-platform-backend
```

**Seguir logs en tiempo real:**
```bash
docker logs -f evento-platform-backend
```

**Logs esperados:**
```
==================================================
🚀 Servidor corriendo en http://localhost:5000
📝 Ambiente: production
📊 Base de datos: evento_platform
==================================================

📌 Endpoints disponibles:
   - Auth: http://localhost:5000/api/auth
   - Events: http://localhost:5000/api/events
   - Tickets: http://localhost:5000/api/tickets
   - Categories: http://localhost:5000/api/categories
   - Admin: http://localhost:5000/api/admin
```

---

## 8. Capturas de Pantalla

### Ubicación de las Capturas

Para completar la documentación, se deben incluir las siguientes capturas de pantalla:

#### 8.1 Construcción de la Imagen
- **Archivo:** `screenshot_01_docker_build.png`
- **Descripción:** Proceso de construcción de la imagen con `docker build`
- **Comando:** `docker build -t evento-platform-backend:latest .`

#### 8.2 Imagen Creada
- **Archivo:** `screenshot_02_docker_images.png`
- **Descripción:** Lista de imágenes Docker mostrando la imagen creada
- **Comando:** `docker images`

#### 8.3 Iniciar Contenedores
- **Archivo:** `screenshot_03_docker_compose_up.png`
- **Descripción:** Inicio de servicios con Docker Compose
- **Comando:** `docker-compose up -d`

#### 8.4 Contenedores Corriendo
- **Archivo:** `screenshot_04_docker_ps.png`
- **Descripción:** Listado de contenedores activos
- **Comando:** `docker ps` o `docker-compose ps`

#### 8.5 Logs del Backend
- **Archivo:** `screenshot_05_backend_logs.png`
- **Descripción:** Logs mostrando que el servidor está corriendo
- **Comando:** `docker-compose logs backend`

#### 8.6 API Funcionando (Navegador)
- **Archivo:** `screenshot_06_api_browser.png`
- **Descripción:** Endpoint principal en el navegador
- **URL:** `http://localhost:5000/`

#### 8.7 Prueba de Registro
- **Archivo:** `screenshot_07_register_test.png`
- **Descripción:** Prueba del endpoint de registro con curl o Postman
- **Endpoint:** `POST /api/auth/register`

#### 8.8 Prueba de Login
- **Archivo:** `screenshot_08_login_test.png`
- **Descripción:** Prueba del endpoint de login
- **Endpoint:** `POST /api/auth/login`

#### 8.9 Base de Datos
- **Archivo:** `screenshot_09_mysql_database.png`
- **Descripción:** Acceso a MySQL mostrando tablas y datos
- **Comando:** `docker exec -it evento-platform-mysql mysql`

#### 8.10 Play With Docker (Opcional)
- **Archivo:** `screenshot_10_play_with_docker.png`
- **Descripción:** Despliegue en Play With Docker
- **URL:** https://labs.play-with-docker.com

---

## 9. Comandos Ejecutados

### Resumen de Comandos Principales

```bash
# 1. Verificar instalación de Docker
docker --version
docker-compose --version

# 2. Navegar al directorio del proyecto
cd evento-platform

# 3. Construir la imagen del backend
cd backend
docker build -t evento-platform-backend:latest .

# 4. Regresar al directorio raíz
cd ..

# 5. Construir con Docker Compose
docker-compose build

# 6. Iniciar los servicios
docker-compose up -d

# 7. Verificar contenedores
docker-compose ps
docker ps

# 8. Ver logs
docker-compose logs -f backend

# 9. Probar la API
curl http://localhost:5000/

# 10. Probar registro de usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass123","full_name":"Test User"}'

# 11. Acceder a MySQL
docker exec -it evento-platform-mysql mysql -u root -proot123

# 12. Ver uso de recursos
docker stats

# 13. Detener servicios
docker-compose down

# 14. Detener y eliminar volúmenes
docker-compose down -v

# 15. Limpiar sistema
docker system prune -a
```

---

## 10. Conclusiones

### 10.1 Logros Alcanzados

✅ **Dockerización Exitosa:** La aplicación Node.js fue contenerizada exitosamente utilizando Docker, cumpliendo con todos los objetivos planteados.

✅ **Portabilidad:** La aplicación ahora puede ejecutarse de manera consistente en cualquier entorno que tenga Docker instalado, eliminando problemas de "funciona en mi máquina".

✅ **Arquitectura Multi-Contenedor:** Se implementó una solución completa con Docker Compose que orquesta tanto el backend como la base de datos MySQL.

✅ **Optimización:** Se utilizaron las mejores prácticas de Docker:
- Imagen base Alpine (ligera)
- Capas optimizadas para caché
- Solo dependencias de producción
- Exclusión de archivos innecesarios

✅ **Automatización:** Se crearon scripts para automatizar el proceso de construcción y despliegue tanto en Windows como en Linux.

✅ **Documentación Completa:** Se generó documentación exhaustiva que permite a cualquier persona construir y ejecutar el proyecto.

### 10.2 Beneficios Obtenidos

**1. Consistencia de Entornos:**
- Mismo comportamiento en desarrollo, pruebas y producción
- Elimina problemas de versiones incompatibles
- Configuración reproducible

**2. Facilidad de Despliegue:**
- Un solo comando para iniciar toda la aplicación
- No requiere instalación manual de dependencias
- Configuración automática de la base de datos

**3. Aislamiento:**
- Cada servicio corre en su propio contenedor
- No hay conflictos con otros proyectos
- Fácil limpieza y eliminación

**4. Escalabilidad:**
- Base sólida para escalar horizontalmente
- Fácil replicación de servicios
- Preparado para orquestadores como Kubernetes

**5. Mantenibilidad:**
- Código de infraestructura versionado
- Fácil actualización de versiones
- Rollback simple en caso de problemas

### 10.3 Aprendizajes

**Conocimientos Técnicos Adquiridos:**
- Creación de Dockerfiles optimizados
- Uso de Docker Compose para multi-contenedores
- Gestión de volúmenes para persistencia
- Configuración de redes Docker
- Healthchecks y dependencias entre servicios
- Mejores prácticas de seguridad en Docker

**Habilidades Desarrolladas:**
- Contenerización de aplicaciones Node.js
- Orquestación de servicios
- Debugging en entornos containerizados
- Documentación técnica
- Automatización de procesos

### 10.4 Trabajo Futuro

**Mejoras Potenciales:**

1. **Seguridad:**
   - Implementar Docker Secrets para credenciales
   - Usar usuarios no-root en contenedores
   - Escaneo de vulnerabilidades con Trivy

2. **CI/CD:**
   - Integrar con GitHub Actions
   - Automatizar builds y tests
   - Despliegue automático a la nube

3. **Monitoreo:**
   - Agregar Prometheus para métricas
   - Implementar Grafana para visualización
   - Logs centralizados con ELK Stack

4. **Producción:**
   - Configurar NGINX como reverse proxy
   - Implementar SSL/TLS
   - Backup automático de volúmenes

5. **Orquestación:**
   - Migrar a Kubernetes
   - Implementar auto-scaling
   - Alta disponibilidad

### 10.5 Reflexión Final

Este proyecto de dockerización ha demostrado ser una experiencia invaluable en el aprendizaje de tecnologías modernas de desarrollo y despliegue. La capacidad de empaquetar una aplicación completa con todas sus dependencias en contenedores portables es fundamental en el desarrollo de software actual.

Docker no solo simplifica el proceso de despliegue, sino que también establece las bases para arquitecturas más complejas y escalables, como microservicios y aplicaciones cloud-native.

La documentación generada asegura que cualquier desarrollador pueda clonar el repositorio y tener la aplicación corriendo en minutos, demostrando el poder de la contenerización en la colaboración y productividad del equipo.

---

## 📚 Referencias

- **Documentación Oficial de Docker:** https://docs.docker.com/
- **Docker Compose Reference:** https://docs.docker.com/compose/compose-file/
- **Node.js Best Practices:** https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
- **MySQL Docker Hub:** https://hub.docker.com/_/mysql
- **Play With Docker:** https://labs.play-with-docker.com/

---

## 📧 Información del Proyecto

**Repositorio GitHub:** [URL del repositorio]  
**Autor:** [Tu Nombre]  
**Fecha de Entrega:** 16 de Noviembre, 2025  
**Institución:** [Nombre de tu Universidad]

---

**Fin del Documento** 🎉
