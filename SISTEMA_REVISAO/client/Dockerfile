# --- STAGE 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root package files for workspace setup
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci

# Copy source code
COPY shared ./shared
COPY client ./client

# Build arguments (passed from Railway)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build frontend
WORKDIR /app/client
RUN npm run build

# --- STAGE 2: Nginx serving static with correct cache headers ---
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Copy custom Nginx config
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/client/dist ./

EXPOSE 80

# Nginx runs on port 80 by default
# Railway will route external PORT to this container
CMD ["nginx", "-g", "daemon off;"]
