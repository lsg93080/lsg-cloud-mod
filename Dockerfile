# ============================================
# S10 — Standard Attributes Service (multi-stage build)
# ============================================
# Stage 1: Build (transpile with Babel, then prune devDeps)
# Stage 2: Runtime (production-only, no babel/devDeps/source)

# --- Stage 1: Builder ---
FROM node:16-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install ALL deps (need babel for transpilation)
RUN npm install --legacy-peer-deps --production=false

# Copy application source (includes shared/, now self-contained)
COPY . .

# Transpile with Babel
RUN npx babel ./src --out-dir build

# Remove devDependencies to shrink node_modules
RUN npm prune --production --legacy-peer-deps \
    && npm install --no-save @babel/runtime

# --- Stage 2: Runtime ---
FROM node:16-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what's needed from builder
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/shared ./shared

# Set ownership
RUN chown -R appuser:appgroup /usr/src/app

USER appuser

EXPOSE 3009

CMD ["node", "./build/bin/www"]
