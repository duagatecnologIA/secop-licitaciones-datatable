# === Etapa 1: Dependencias ===
# Instala las dependencias en una capa separada para aprovechar el cacheo de Docker.
FROM node:20-alpine AS deps
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# === Etapa 2: Builder ===
# Construye la aplicación usando las dependencias de la etapa anterior.
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Asegúrate de que el archivo next.config.mjs esté configurado con 'output: "standalone"'
RUN pnpm build

# === Etapa 3: Runner ===
# Prepara la imagen final de producción, que es ligera y optimizada.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Crea un usuario y grupo dedicados para la aplicación por seguridad.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia la salida 'standalone' optimizada desde la etapa 'builder'.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambia al usuario no-root.
USER nextjs

EXPOSE 3000

ENV PORT 3000

# El comando para iniciar el servidor de Node.js optimizado que Next.js crea.
CMD ["node", "server.js"]
