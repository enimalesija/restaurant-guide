# -------------------------------
# Backend Dockerfile
# Node.js + TypeScript + Fastify
# -------------------------------

# ---- Builder stage ----
# Use lightweight Node.js image for building
FROM node:18-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy only dependency files first (for caching layers)
COPY package*.json ./

# Install exact versions from package-lock.json
# Faster, reproducible builds
RUN npm ci

# Copy source code and TypeScript config
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript → JavaScript
RUN npm run build

# Here is the Runtime stage
# Use fresh Node.js image for production runtime
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy only what’s needed for running the app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 4000

# Start the compiled app
CMD ["node", "dist/index.js"]

