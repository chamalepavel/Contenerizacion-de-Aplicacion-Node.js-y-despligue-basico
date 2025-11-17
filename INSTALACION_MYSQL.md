# 📦 Guía de Instalación de MySQL en Windows

## Opción 1: Instalador MySQL (Recomendado)

### Paso 1: Descargar MySQL
1. Ve a: https://dev.mysql.com/downloads/installer/
2. Descarga "MySQL Installer for Windows" (mysql-installer-web-community)
3. Haz clic en "Download" (no necesitas crear cuenta, usa "No thanks, just start my download")

### Paso 2: Instalar MySQL
1. Ejecuta el instalador descargado
2. Selecciona "Developer Default" o "Server only"
3. Haz clic en "Next" y luego "Execute" para instalar los componentes
4. Espera a que se complete la instalación

### Paso 3: Configurar MySQL Server
1. En "Type and Networking":
   - Config Type: Development Computer
   - Port: 3306 (por defecto)
   - Haz clic en "Next"

2. En "Authentication Method":
   - Selecciona "Use Strong Password Encryption"
   - Haz clic en "Next"

3. En "Accounts and Roles":
   - Establece una contraseña para el usuario root (¡IMPORTANTE: recuerda esta contraseña!)
   - Ejemplo: usa "root123" para desarrollo local
   - Haz clic en "Next"

4. En "Windows Service":
   - Deja las opciones por defecto
   - Asegúrate que "Start the MySQL Server at System Startup" esté marcado
   - Haz clic en "Next"

5. Haz clic en "Execute" para aplicar la configuración
6. Cuando termine, haz clic en "Finish"

### Paso 4: Verificar la Instalación
Abre CMD o PowerShell y ejecuta:
```bash
mysql --version
```

Deberías ver algo como: `mysql  Ver 8.0.xx for Win64`

## Opción 2: XAMPP (Alternativa más simple)

Si prefieres una instalación más sencilla:

1. Descarga XAMPP: https://www.apachefriends.org/download.html
2. Instala XAMPP
3. Abre el Panel de Control de XAMPP
4. Inicia el servicio "MySQL"
5. Las credenciales por defecto son:
   - Usuario: root
   - Contraseña: (vacía)

## Configurar el Proyecto

Una vez instalado MySQL, actualiza el archivo `.env` en `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123    # Usa la contraseña que estableciste
DB_NAME=evento_platform
DB_PORT=3306
```

## Crear la Base de Datos

### Opción A: Desde MySQL Workbench (viene con MySQL)
1. Abre MySQL Workbench
2. Conecta con tu servidor local
3. Abre el archivo `backend/database/schema.sql`
4. Ejecuta el script completo

### Opción B: Desde la línea de comandos
```bash
# Conectar a MySQL
mysql -u root -p

# Cuando te pida la contraseña, ingresa la que estableciste
# Luego ejecuta:
source C:/Users/PavelHuberto/Desktop/evento-platform/backend/database/schema.sql
```

### Opción C: Usando el comando directo
```bash
mysql -u root -p < C:/Users/PavelHuberto/Desktop/evento-platform/backend/database/schema.sql
```

## Verificar que la Base de Datos se Creó

```bash
mysql -u root -p
```

Luego en MySQL:
```sql
SHOW DATABASES;
USE evento_platform;
SHOW TABLES;
```

Deberías ver las tablas: roles, usuarios, categorias, eventos, boletos, transacciones

## Problemas Comunes

### Error: "mysql no se reconoce como comando"
- Agrega MySQL al PATH de Windows:
  1. Busca "Variables de entorno" en Windows
  2. Edita la variable PATH
  3. Agrega: `C:\Program Files\MySQL\MySQL Server 8.0\bin`

### Error: "Access denied for user 'root'@'localhost'"
- Verifica que estás usando la contraseña correcta
- Si olvidaste la contraseña, reinstala MySQL

### El servicio MySQL no inicia
- Abre "Servicios" de Windows (services.msc)
- Busca "MySQL80" o similar
- Haz clic derecho > Iniciar

## Siguiente Paso

Una vez que MySQL esté instalado y la base de datos creada, podremos iniciar el servidor backend.
