# Build stage
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
COPY --from=builder /app/shared ./shared

# Expose port (ajustado para o padrão do Railway)
EXPOSE 5000

ENV NODE_ENV=production

# Start command
CMD ["npm", "start", "--workspace=server"]
