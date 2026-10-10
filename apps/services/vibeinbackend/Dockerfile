# syntax=docker/dockerfile:1.7

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/
# workspace symlink (node_modules/@app/*) toiri korar jonno packages lagbe
COPY packages/ ./packages/

RUN npm ci

# ---------- builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package.json tsconfig.base.json turbo.json ./
COPY packages/ ./packages/
COPY apps/services/vibeinbackend/ ./apps/services/vibeinbackend/

ENV TURBO_TELEMETRY_DISABLED=1

# vibeinbackend + tar shob @app/* dependency, dependency order e build hobe
RUN npx turbo run build --filter=vibeinbackend...

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/

# built packages (dist soho) ar workspace symlink shoho node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

# compiled service
COPY --from=builder /app/apps/services/vibeinbackend/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]