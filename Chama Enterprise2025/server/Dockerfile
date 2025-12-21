# --- STAGE 1: Build ---
FROM node:20-slim AS builder
WORKDIR /app

# Argumentos
ENV NODE_ENV=development

# 1. Copiar package files para a RAIZ (para node_modules ficar em /app/node_modules)
COPY server/package.json ./
# Ignorar package-lock.json da pasta server se quisermos usar o linux, mas o comando abaixo sobrescreve
COPY server/package-lock.linux.json ./package-lock.json

# 2. Instalar dependências (na raiz)
RUN npm install

# 3. Copiar código fonte
COPY server/ ./server/
COPY shared/ ./shared/

# 4. Build (agora o TSC acha dependências em ../node_modules)
WORKDIR /app/server
RUN npm run build

# --- STAGE 2: Runtime ---
FROM node:20-slim

WORKDIR /app

# Non-Root User (M2)
USER node

# Timezone UTC (A2)
ENV TZ=UTC

# Copia node_modules (da raiz) e build artifacts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/server/dist ./server/dist
COPY --from=builder --chown=node:node /app/server/package.json ./server/

EXPOSE 5000

# Execução Direta
# O TSC com rootDir '..' gera dist/server/index.js e dist/shared/schema.js
# Como copiamos 'server/dist' para 'server/dist', o caminho final é server/dist/server/index.js
CMD ["node", "server/dist/server/index.js"]
