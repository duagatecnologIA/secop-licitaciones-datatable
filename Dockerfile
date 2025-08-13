# === Etapa 1: Builder ===
# Usa una imagen de Node para construir la aplicación
FROM node:20-alpine AS builder

# Instala pnpm
RUN npm install -g pnpm

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json pnpm-lock.yaml* ./

# Instala TODAS las dependencias (incluidas las de desarrollo) con pnpm
# Se usa --config.strict-peer-dependencies=false para resolver conflictos
RUN pnpm install --config.strict-peer-dependencies=false

# Copia el resto del código fuente
COPY . .

# Construye la aplicación para producción
RUN pnpm run build

# === Etapa 2: Producción ===
# Usa una imagen de Node limpia y ligera para la producción
FROM node:20-alpine AS production

# Instala pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia los manifiestos de dependencias desde la etapa 'builder'
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./

# Instala ÚNICAMENTE las dependencias de producción con pnpm
# Se usa --config.strict-peer-dependencies=false para resolver el mismo conflicto
RUN pnpm install --prod --config.strict-peer-dependencies=false

# Copia los artefactos de la build desde la etapa 'builder'
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expone el puerto que usará la aplicación
EXPOSE 3000

# El comando para iniciar la aplicación
CMD ["pnpm", "start"]
