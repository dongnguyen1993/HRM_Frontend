# ==============================================================================
# STAGE 1: Build Frontend SPA
# ==============================================================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

# Copy source code and build
COPY . .
RUN npm run build

# ==============================================================================
# STAGE 2: Serve via Nginx
# ==============================================================================
FROM nginx:alpine AS final

# Copy Nginx Configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
