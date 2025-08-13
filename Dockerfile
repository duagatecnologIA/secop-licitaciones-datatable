# === Etapa 1: Dependencias ===
# Instala las dependencias necesarias para la build en una capa separada para el cacheo.
FROM node:20-alpine AS deps
# Instala pnpm
RUN npm install -g pnpm
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json pnpm-lock.yaml* ./
# Instala las dependencias usando el lockfile para asegurar consistencia
RUN pnpm install --frozen-lockfile

# === Etapa 2: Builder ===
# Construye la aplicación usando las dependencias de la etapa anterior.
FROM node:20-alpine AS builder
# Instala pnpm
RUN npm install -g pnpm
WORKDIR /app

# Copia las dependencias ya instaladas desde la etapa 'deps'
COPY --from=deps /app/node_modules ./node_modules
# Copia el resto del código fuente
COPY . .

# Asegúrate de que el archivo next.config.mjs esté configurado con 'output: "standalone"'
# Construye la aplicación
RUN pnpm build

# === Etapa 3: Runner ===
# Prepara la imagen final de producción, que es ligera y optimizada.
FROM node:20-alpine AS runner
WORKDIR /app

# Establece las variables de entorno para producción
ENV NODE_ENV=production
# Deshabilita la telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Copia la salida 'standalone' optimizada desde la etapa 'builder'.
# Esta carpeta contiene solo lo necesario para ejecutar la app.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expone el puerto 3000, el predeterminado para Next.js
EXPOSE 3000

# El comando para iniciar el servidor de Node.js optimizado que Next.js crea.
CMD ["node", "server.js"]
