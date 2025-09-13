# ---------------------------------
# Frontend Dockerfile
# React + Vite + Nginx
# ---------------------------------

# ---- Build stage ----
# Use Node.js lightweight image to build static assets
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy dependency files first (better build caching)
COPY package*.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy project files
COPY . .

# Build the frontend (output → /app/dist)
RUN npm run build

# ---- Runtime stage ----
# Use Nginx to serve the production-ready build
FROM nginx:alpine AS runtime

# Copy compiled build output into nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose container port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
