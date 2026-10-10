# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

# ১. রুট এবং vibeinbackend-এর package.json কপি
COPY package*.json ./
COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/

# ২. রুট লেভেলের package-lock.json দিয়ে ইন্সটল
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ৩. ওয়ার্কস্পেস ব্যবহার করে বিল্ড
RUN npm run build -w apps/services/vibeinbackend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# ৪. প্রোডাকশনের জন্য প্রয়োজনীয় ফাইল কপি
COPY package*.json ./
COPY apps/services/vibeinbackend/package*.json ./apps/services/vibeinbackend/
COPY --from=deps /app/node_modules ./node_modules

# ৫. বিল্ড ফোল্ডার কপি
COPY --from=builder /app/apps/services/vibeinbackend/dist ./dist

# ৬. ডেভ ডিপেন্ডেন্সি বাদ দেওয়া
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]