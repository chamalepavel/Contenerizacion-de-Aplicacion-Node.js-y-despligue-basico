# Utilizar la imagen oficial de Node.js como base
# Usamos la versión LTS (Long Term Support) para mayor estabilidad
FROM node:18-alpine

# Establecer información del mantenedor
LABEL maintainer="evento-platform"
LABEL description="API RESTful de Plataforma de Eventos - Node.js + Express + MySQL"

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos de dependencias primero (mejor aprovechamiento de caché)
COPY package*.json ./

# Instalar las dependencias de producción
# --only=production instala solo las dependencias necesarias, no las de desarrollo
RUN npm ci --only=production

# Copiar el resto del código fuente de la aplicación
COPY . .

# Crear el directorio de uploads si no existe
RUN mkdir -p uploads

# Exponer el puerto en el que corre la aplicación
EXPOSE 5000

# Definir variables de entorno por defecto (pueden ser sobrescritas)
ENV NODE_ENV=production
ENV PORT=5000

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
