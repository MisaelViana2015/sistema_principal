# ================================================================
# STAGE 1: Builder
# ================================================================
FROM node:20.18.1-alpine AS builder

WORKDIR /app

# Copiar package files (SEM LOCKFILE para Cross-Platform)
COPY package.json ./
# Workspaces
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

# Instalar TODAS as dependências (fresco)
RUN npm install --include=dev

# Copiar código
COPY . .

# Build (TypeScript → JavaScript)
RUN npm run build

# ================================================================
# STAGE 2: Production
# ================================================================
FROM node:20.18.1-alpine

# Instalar PostgreSQL client
RUN apk add --no-cache postgresql-client

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copiar node_modules de produção (reinstalação limpa)
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

# Instalar LIMPO
RUN npm install --omit=dev

# Copiar artefatos compilados
COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=nodejs:nodejs /app/client/dist ./client/dist

# Trocar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => { \
    let data = ''; \
    r.on('data', chunk => data += chunk); \
    r.on('end', () => { \
    try { \
    const result = JSON.parse(data); \
    process.exit(result.status === 'ok' && result.database === 'connected' ? 0 : 1); \
    } catch(e) { process.exit(1); } \
    }); \
    }).on('error', () => process.exit(1))" || exit 1

# Start
CMD ["node", "server/dist/server/index.js"]
