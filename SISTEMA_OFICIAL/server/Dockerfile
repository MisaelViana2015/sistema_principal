# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code and shared folder
# Note: In the new structure, shared is at ../shared
COPY . .
COPY ../shared ./shared

# Build the server
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
# We also need the shared folder if it's referenced at runtime (it shouldn't be if it's compiled, but Drizzle might need it for migrations if they are run via ts-node)
COPY --from=builder /app/shared ./shared

# Expose port
EXPOSE 10000

# Start command
CMD ["npm", "start"]
