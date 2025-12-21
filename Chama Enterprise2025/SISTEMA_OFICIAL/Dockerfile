# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies (workspaces handle this)
# Remove package-lock.json to avoid platform-specific optional dependency issues (rollup-linux-x64-musl)
RUN rm -f package-lock.json
RUN npm install

# Copy source code
COPY . .

# Default env vars for test deployment
ENV NODE_ENV=production
ENV JWT_SECRET=rota-verde-super-secret-key-2024

# Build the server (this will also compile shared if needed)
# Generate migrations files (ensure meta/_journal.json exists)
ENV DATABASE_URL="postgres://dummy:dummy@localhost:5432/dummy"
RUN cd server && npx drizzle-kit generate:pg
RUN npm run build:server
# Build the client
RUN npm run build:client
# DEBUG: List built client files to confirm structure
RUN ls -R client/dist || echo "client/dist not found"

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package files for production
COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Remove lockfile and install production dependencies
RUN rm -f package-lock.json
RUN npm install --production --workspace=server --workspace=shared

# Copy built files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/shared ./shared
# Copy migrations (SQL files are not compiled, so they need to be copied explicitly)
COPY --from=builder /app/server/scripts/db/migrations ./server/scripts/db/migrations
# Copy client build to where server expects it (dist/client relative to dist/server/app.js)
COPY --from=builder /app/client/dist ./server/dist/client
# DEBUG: Confirm files were copied correctly
RUN ls -R ./server/dist/client || echo "server/dist/client not found"

# Expose port (ajustado para o padrão do Railway)
EXPOSE 5000

ENV NODE_ENV=production
ENV JWT_SECRET=rota-verde-super-secret-key-2024

# Start command
CMD ["npm", "start", "--workspace=server"]
