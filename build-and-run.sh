#!/bin/bash
# Script para construir y ejecutar la aplicación dockerizada
# Plataforma de Eventos - Node.js API

echo "======================================================"
echo "  Construcción y Despliegue - Plataforma de Eventos"
echo "======================================================"
echo ""

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar que Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker no está corriendo"
    echo "Por favor inicia Docker Desktop y ejecuta este script nuevamente"
    exit 1
fi

echo "✅ Docker está instalado y corriendo"
echo ""

# Paso 1: Construir las imágenes
echo "📦 Paso 1: Construyendo imágenes Docker..."
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Error al construir las imágenes"
    exit 1
fi

echo "✅ Imágenes construidas exitosamente"
echo ""

# Paso 2: Iniciar los contenedores
echo "🚀 Paso 2: Iniciando contenedores..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Error al iniciar los contenedores"
    exit 1
fi

echo "✅ Contenedores iniciados exitosamente"
echo ""

# Paso 3: Esperar a que MySQL esté listo
echo "⏳ Paso 3: Esperando a que MySQL esté listo..."
sleep 10

# Paso 4: Verificar el estado
echo "📊 Paso 4: Verificando estado de los contenedores..."
echo ""
docker-compose ps
echo ""

# Paso 5: Mostrar logs iniciales
echo "📝 Logs del backend:"
echo "===================="
docker-compose logs --tail=20 backend
echo ""

# Paso 6: Probar la API
echo "🔍 Paso 6: Probando la API..."
echo ""
sleep 5

if command -v curl &> /dev/null; then
    echo "Respuesta de http://localhost:5000/:"
    curl -s http://localhost:5000/ | jq . 2>/dev/null || curl -s http://localhost:5000/
    echo ""
else
    echo "💡 Abre tu navegador en: http://localhost:5000/"
fi

echo ""
echo "======================================================"
echo "  ✅ Despliegue completado exitosamente"
echo "======================================================"
echo ""
echo "📌 Información importante:"
echo "   - API Backend: http://localhost:5000"
echo "   - MySQL: localhost:3306"
echo ""
echo "🛠️  Comandos útiles:"
echo "   - Ver logs:        docker-compose logs -f"
echo "   - Detener:         docker-compose down"
echo "   - Reiniciar:       docker-compose restart"
echo "   - Ver estado:      docker-compose ps"
echo ""
echo "📚 Consulta README_DOCKER.md para más información"
echo ""
