# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app


# 1. We have copied package.json file and packeage-lock.json
# COPY package*.json ./
# COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/
COPY package*.json ./apps/services/vibeinbackend
COPY ../../../package*.json ./

# 2. root package.json and vibeinbackend package.json dependency install
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ৩. build the vibeinbackend using workspace
RUN npm run build -w apps/services/vibeinbackend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# ৪. only production needed file copy
COPY package*.json ./apps/services/vibeinbackend
COPY ../../../package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# ৫. final dist file copy
COPY --from=builder ./dist ./dist

# ৬. again install dependency but only dependencies ignore devdependencies
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]