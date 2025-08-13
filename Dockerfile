# === Etapa 1: Builder ===
# Usa una imagen de Node para construir la aplicación
FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala TODAS las dependencias (incluidas las de desarrollo)
# Se usa --legacy-peer-deps para resolver conflictos de versiones entre paquetes
RUN npm install --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# Construye la aplicación para producción
RUN npm run build

# === Etapa 2: Producción ===
# Usa una imagen de Node limpia y ligera para la producción
FROM node:20-alpine AS production

WORKDIR /app

# Copia los manifiestos de dependencias desde la etapa 'builder'
COPY --from=builder /app/package*.json ./

# Instala ÚNICAMENTE las dependencias de producción
RUN npm install --production

# Copia los artefactos de la build desde la etapa 'builder'
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expone el puerto que usará la aplicación
EXPOSE 3000

# El comando para iniciar la aplicación
CMD ["npm", "start"]