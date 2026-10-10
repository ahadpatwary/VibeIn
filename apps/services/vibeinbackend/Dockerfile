# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

# 1. Copy root and service level package files for workspace dependency resolution
COPY package*.json ./
COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/
# Copy shared packages package.json files if they have individual package.json files
# COPY packages/*/package.json ./packages/ 

# 2. Install all dependencies across the monorepo
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# 3. Copy only the packages folder and the vibeinbackend source code
COPY packages/ ./packages/
COPY apps/services/vibeinbackend/ ./apps/services/vibeinbackend/
COPY tsconfig.json ./
COPY package.json ./

# 4. Build the vibeinbackend service using npm workspace
RUN npm run build -w apps/services/vibeinbackend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 5. Copy package files and node_modules for production runtime
COPY package*.json ./
COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/
COPY --from=deps /app/node_modules ./node_modules

# 6. Copy compiled dist folder from builder stage
COPY --from=builder /app/apps/services/vibeinbackend/dist ./dist

# 7. Prune development dependencies to optimize image size
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]