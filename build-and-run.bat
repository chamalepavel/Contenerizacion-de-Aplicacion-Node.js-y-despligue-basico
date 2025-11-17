@echo off
REM Script para construir y ejecutar la aplicación dockerizada en Windows
REM Plataforma de Eventos - Node.js API

echo ======================================================
echo   Construccion y Despliegue - Plataforma de Eventos
echo ======================================================
echo.

REM Verificar que Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no esta instalado
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar que Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no esta corriendo
    echo Por favor inicia Docker Desktop y ejecuta este script nuevamente
    pause
    exit /b 1
)

echo Docker esta instalado y corriendo
echo.

REM Paso 1: Construir las imágenes
echo Paso 1: Construyendo imagenes Docker...
docker-compose build --no-cache

if errorlevel 1 (
    echo Error al construir las imagenes
    pause
    exit /b 1
)

echo Imagenes construidas exitosamente
echo.

REM Paso 2: Iniciar los contenedores
echo Paso 2: Iniciando contenedores...
docker-compose up -d

if errorlevel 1 (
    echo Error al iniciar los contenedores
    pause
    exit /b 1
)

echo Contenedores iniciados exitosamente
echo.

REM Paso 3: Esperar a que MySQL esté listo
echo Paso 3: Esperando a que MySQL este listo...
timeout /t 15 /nobreak >nul

REM Paso 4: Verificar el estado
echo Paso 4: Verificando estado de los contenedores...
echo.
docker-compose ps
echo.

REM Paso 5: Mostrar logs iniciales
echo Logs del backend:
echo ====================
docker-compose logs --tail=20 backend
echo.

REM Paso 6: Probar la API
echo Paso 6: Probando la API...
echo.
timeout /t 5 /nobreak >nul

echo Probando endpoint principal...
curl -s http://localhost:5000/ 2>nul
if errorlevel 1 (
    echo Abre tu navegador en: http://localhost:5000/
)
echo.

echo.
echo ======================================================
echo   Despliegue completado exitosamente
echo ======================================================
echo.
echo Informacion importante:
echo    - API Backend: http://localhost:5000
echo    - MySQL: localhost:3306
echo.
echo Comandos utiles:
echo    - Ver logs:        docker-compose logs -f
echo    - Detener:         docker-compose down
echo    - Reiniciar:       docker-compose restart
echo    - Ver estado:      docker-compose ps
echo.
echo Consulta README_DOCKER.md para mas informacion
echo.

pause
