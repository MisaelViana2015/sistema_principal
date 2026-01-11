# Build stage
# CACHE_BUST: 2026-01-03-17-16 - Force rebuild for /api/agent endpoints
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies (workspaces handle this)
# FIX: Remove lockfile to force npm to resolve Linux-specific optional dependencies (like rollup-linux)
RUN rm -f package-lock.json
RUN npm install

# Copy source code
# Invalidate cache by changing this value
ARG CACHEBUST=2026010317370
COPY . .

# Build the server (this will also compile shared if needed)
RUN npm run build:server
RUN npm run build:client

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files for production
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install production dependencies
RUN npm ci --production --workspace=server --workspace=shared

# Copy built files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Copy migrations folder (essential for Drizzle)
COPY --from=builder /app/server/scripts/db/migrations ./server/scripts/db/migrations

# Copy bootstrap migrations (SQL files)
COPY --from=builder /app/server/scripts/migrations ./server/scripts/migrations
# Note: bootstrap.js is already in server/dist (from line 38)

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port (ajustado para o padrão do Railway)
EXPOSE 5000

ENV NODE_ENV=production

# Use entrypoint for bootstrap, then start server
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "start", "--workspace=server"]
