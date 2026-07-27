# =============================================================================
# Cloud Module Website v2 — Multi-stage Dockerfile
# =============================================================================
# Stage 1 (builder): instala deps, compila Vite (genera dist/)
# Stage 2 (runtime): nginx:alpine sirviendo los archivos estáticos
#
# Vite usa base: '/cloud/' — los assets se sirven en /cloud/assets/*.
# El API gateway (nginx.conf) proxea /cloud/ a este contenedor.
# =============================================================================

FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_AUTH_SERVICE_URL
ARG VITE_VITRINA_URL
ARG VITE_HOST_URL
ARG VITE_S01_URL
ARG VITE_S02_URL
ARG VITE_S10_URL
ARG VITE_S11_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

RUN npm run build

# -----------------------------------------------------------------------------

FROM nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /usr/src/app/dist .

# Config mínima: rutas no encontradas → index.html (SPA con base /cloud/)
RUN printf 'server {\n\
    listen 8081;\n\
    root /usr/share/nginx/html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    add_header Cache-Control "no-cache";\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
