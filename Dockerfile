# Etapa 1: Build de la app
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo package.json y package-lock.json para cachear dependencias
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Ahora copiamos el resto del código
COPY . .

RUN npm run build

# Etapa 2: Imagen final liviana
FROM node:20-alpine AS runner

WORKDIR /app

# Copiamos node_modules y build desde la etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
