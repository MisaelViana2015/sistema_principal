# --- STAGE 1: Build & Lockfile Gen ---
FROM node:20-slim AS builder
WORKDIR /app

# Argumentos
ENV NODE_ENV=development

# Copia TODO o código
COPY . .

# Sobrescreve lockfile com versão Linux (Reprodutibilidade - C1)
COPY server/package-lock.linux.json ./package-lock.json

# Instalação Limpa (Reprodutibilidade - C1)
RUN npm ci

# Build
WORKDIR /app/server
RUN npm run build

# --- STAGE 2: Runtime ---
FROM node:20-slim

WORKDIR /app

# Non-Root User (M2)
USER node

# Timezone UTC (A2)
ENV TZ=UTC

# Copia node_modules e build artifacts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/server/dist ./dist

# Copia package.json para permitir npm start (se necessário) ou validação
COPY --from=builder --chown=node:node /app/server/package.json ./

EXPOSE 5000

# Execução Direta (M3 - Menos overhead)
CMD ["node", "dist/server/index.js"]
