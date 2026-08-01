# Multi-stage Dockerfile per Gestione Casa PWA su Proxmox LXC

# 1. Stage di Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. Stage di Produzione con Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurazione Nginx per PWA (Single Page Application fallback)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
