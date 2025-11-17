# 🚀 Instrucciones para Construir y Ejecutar el Contenedor Docker

## ⚡ Inicio Rápido

### Prerrequisitos
1. **Docker Desktop** instalado y corriendo
   - Descargar desde: https://www.docker.com/products/docker-desktop
   - Asegúrate de que Docker Desktop esté abierto y corriendo

2. **Git** (opcional, para clonar el repositorio)

---

## 📋 Pasos para Ejecutar la Aplicación

### Opción 1: Usando Scripts Automatizados (MÁS FÁCIL)

#### En Windows:
1. Abre Docker Desktop y espera a que esté completamente iniciado
2. Abre el Explorador de Archivos y navega a la carpeta del proyecto
3. Haz doble clic en el archivo `build-and-run.bat`
4. Espera a que termine el proceso (aproximadamente 2-3 minutos)
5. Abre tu navegador en: http://localhost:5000

#### En Linux/Mac:
1. Abre una terminal
2. Navega al directorio del proyecto:
   ```bash
   cd evento-platform
   ```
3. Da permisos de ejecución al script:
   ```bash
   chmod +x build-and-run.sh
   ```
4. Ejecuta el script:
   ```bash
   ./build-and-run.sh
   ```
5. Abre tu navegador en: http://localhost:5000

---

### Opción 2: Manualmente (Paso a Paso)

#### Paso 1: Abrir Docker Desktop
- Asegúrate de que Docker Desktop esté corriendo
- Verás el ícono de Docker en la bandeja del sistema

#### Paso 2: Abrir Terminal/PowerShell/CMD
- Windows: Presiona `Win + R`, escribe `cmd` y presiona Enter
- Mac: Abre Terminal desde Aplicaciones
- Linux: Abre tu terminal favorita

#### Paso 3: Navegar al Proyecto
```bash
cd "c:\Users\PavelHuberto\4 semeste\evento-platform"
```

#### Paso 4: Verificar Docker
```bash
docker --version
docker-compose --version
```

Deberías ver algo como:
```
Docker version 28.5.1, build e180ab8
Docker Compose version v2.40.0-desktop.1
```

#### Paso 5: Construir las Imágenes
```bash
docker-compose build
```

Este proceso tomará unos minutos la primera vez. Verás algo como:
```
[+] Building 45.2s (10/10) FINISHED
 => [internal] load build definition from Dockerfile
 => [1/5] FROM docker.io/library/node:18-alpine
 => [2/5] WORKDIR /usr/src/app
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm ci --only=production
 => [5/5] COPY . .
 => exporting to image
```

#### Paso 6: Iniciar los Contenedores
```bash
docker-compose up -d
```

Verás:
```
[+] Running 4/4
 ✔ Network evento-platform_evento-network    Created
 ✔ Volume "evento-platform_mysql_data"       Created
 ✔ Volume "evento-platform_uploads_data"     Created
 ✔ Container evento-platform-mysql           Started
 ✔ Container evento-platform-backend         Started
```

#### Paso 7: Verificar que Todo Esté Corriendo
```bash
docker-compose ps
```

Deberías ver:
```
NAME                          STATUS          PORTS
evento-platform-backend       Up 30 seconds   0.0.0.0:5000->5000/tcp
evento-platform-mysql         Up 35 seconds   0.0.0.0:3306->3306/tcp
```

#### Paso 8: Ver los Logs (Opcional)
```bash
docker-compose logs -f backend
```

Presiona `Ctrl + C` para salir de los logs.

#### Paso 9: Probar la API

**Opción A - Navegador:**
Abre tu navegador en: http://localhost:5000

**Opción B - Comando curl (Git Bash/Linux/Mac):**
```bash
curl http://localhost:5000/
```

**Opción C - PowerShell (Windows):**
```powershell
Invoke-WebRequest -Uri http://localhost:5000/ -UseBasicParsing
```

Deberías ver una respuesta JSON:
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

---

## 🧪 Probar la API

### 1. Registrar un Usuario

**Con curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\",\"full_name\":\"Usuario de Prueba\"}"
```

**Con PowerShell:**
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
    full_name = "Usuario de Prueba"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register -Method POST -Body $body -ContentType "application/json"
```

### 2. Iniciar Sesión

**Con curl:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 3. Ver Eventos
```bash
curl http://localhost:5000/api/events
```

---

## 🛑 Detener la Aplicación

### Detener los Contenedores (Mantiene los Datos)
```bash
docker-compose down
```

### Detener y Eliminar Datos
```bash
docker-compose down -v
```

**⚠️ Advertencia:** El segundo comando eliminará TODOS los datos de la base de datos.

---

## 🔄 Reiniciar la Aplicación

Si ya construiste la imagen antes y solo quieres reiniciar:

```bash
docker-compose up -d
```

Si hiciste cambios en el código y quieres reconstruir:

```bash
docker-compose up -d --build
```

---

## 🐛 Solución de Problemas

### Problema 1: "Docker no está corriendo"

**Solución:**
1. Abre Docker Desktop
2. Espera a que se inicie completamente (verás el ícono de Docker en verde)
3. Intenta nuevamente

### Problema 2: "Puerto 5000 ya en uso"

**Solución en Windows:**
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :5000

# Detener el proceso (reemplaza PID con el número que viste)
taskkill /PID [PID] /F
```

**Solución en Linux/Mac:**
```bash
# Ver qué está usando el puerto
lsof -i :5000

# Detener el proceso
kill -9 [PID]
```

### Problema 3: "El backend no se conecta a MySQL"

**Solución:**
```bash
# Reiniciar solo el backend
docker-compose restart backend

# Si eso no funciona, reinicia todo
docker-compose down
docker-compose up -d
```

### Problema 4: "Cambios en el código no se reflejan"

**Solución:**
```bash
# Reconstruir sin caché
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problema 5: Ver Logs para Debugging

```bash
# Ver logs del backend
docker-compose logs backend

# Seguir logs en tiempo real
docker-compose logs -f backend

# Ver logs de MySQL
docker-compose logs mysql
```

### Problema 6: Acceder al Contenedor para Debugging

**Acceder al contenedor del backend:**
```bash
docker exec -it evento-platform-backend sh
```

**Acceder a MySQL:**
```bash
docker exec -it evento-platform-mysql mysql -u root -proot123
```

Dentro de MySQL:
```sql
USE evento_platform;
SHOW TABLES;
SELECT * FROM users;
EXIT;
```

---

## 📊 Comandos Útiles

```bash
# Ver contenedores activos
docker ps

# Ver todas las imágenes
docker images

# Ver logs
docker-compose logs -f

# Ver uso de recursos
docker stats

# Detener un contenedor específico
docker stop evento-platform-backend

# Iniciar un contenedor detenido
docker start evento-platform-backend

# Reiniciar un contenedor
docker restart evento-platform-backend

# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune -a

# Ver volúmenes
docker volume ls

# Limpiar todo el sistema Docker
docker system prune -a --volumes
```

---

## 🌐 Despliegue en Play With Docker (Online)

Si no tienes Docker instalado localmente, puedes usar Play With Docker:

1. Ve a: https://labs.play-with-docker.com
2. Inicia sesión con tu cuenta de Docker Hub
3. Click en "+ ADD NEW INSTANCE"
4. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/evento-platform.git
   cd evento-platform
   ```
5. Ejecuta:
   ```bash
   docker-compose up -d
   ```
6. Espera unos minutos y click en el puerto "5000" que aparecerá arriba
7. ¡Listo! Tu API está corriendo en la nube

**Nota:** Las instancias de Play With Docker duran 4 horas.

---

## 📚 Documentación Adicional

- **README_DOCKER.md** - Guía completa y detallada
- **DOCUMENTACION_DOCKER.md** - Documentación técnica para el PDF
- **docker-compose.yml** - Configuración de los servicios
- **backend/Dockerfile** - Configuración de la imagen Docker

---

## ✅ Checklist de Verificación

Antes de entregar tu tarea, verifica:

- [ ] Docker Desktop está instalado y corriendo
- [ ] Los contenedores se construyen sin errores
- [ ] Los contenedores están corriendo (`docker-compose ps`)
- [ ] La API responde en http://localhost:5000
- [ ] Puedes registrar un usuario
- [ ] Puedes hacer login
- [ ] La base de datos tiene las tablas creadas
- [ ] Tienes capturas de pantalla de todos los pasos
- [ ] El código está subido a GitHub
- [ ] El PDF con la documentación está completo

---

## 📸 Capturas de Pantalla Necesarias

Para tu PDF de entrega, toma capturas de:

1. ✅ Comando `docker build` ejecutándose
2. ✅ Comando `docker images` mostrando la imagen creada
3. ✅ Comando `docker-compose up -d` iniciando servicios
4. ✅ Comando `docker ps` mostrando contenedores activos
5. ✅ Logs del backend con `docker-compose logs backend`
6. ✅ API en el navegador (http://localhost:5000)
7. ✅ Prueba de registro de usuario (curl o Postman)
8. ✅ Prueba de login (curl o Postman)
9. ✅ Base de datos MySQL con `docker exec`
10. ✅ (Opcional) Play With Docker funcionando

---

## 🎯 Resumen de Comandos para la Entrega

```bash
# 1. Verificar Docker
docker --version
docker-compose --version

# 2. Navegar al proyecto
cd evento-platform

# 3. Construir
docker-compose build

# 4. Iniciar
docker-compose up -d

# 5. Verificar
docker-compose ps

# 6. Ver logs
docker-compose logs backend

# 7. Probar
curl http://localhost:5000/

# 8. Detener
docker-compose down
```

---

## 💡 Consejos

- Asegúrate de que Docker Desktop esté abierto ANTES de ejecutar cualquier comando
- La primera construcción tarda más (descarga imágenes)
- Las construcciones siguientes son mucho más rápidas (usa caché)
- Si tienes problemas, revisa los logs: `docker-compose logs -f`
- Puedes abrir Docker Desktop para ver visualmente los contenedores corriendo
- No olvides documentar TODO con capturas de pantalla

---

## 📧 Soporte

Si tienes problemas:
1. Revisa la sección de Solución de Problemas
2. Consulta README_DOCKER.md para más detalles
3. Verifica los logs con `docker-compose logs -f`
4. Pregunta a tu profesor o compañeros

---

**¡Buena suerte con tu entrega!** 🎉
