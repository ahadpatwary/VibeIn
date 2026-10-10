# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app

# ১. সরাসরি এই ফোল্ডারের package.json কপি করো (কারণ এটাই এখন রেলওয়ের রুট)
COPY package*.json ./

# ২. ডিপেন্ডেন্সি ইনস্টল
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ৩. সাধারণ বিল্ড কমান্ড (মনোরেপো ফ্লাগ ছাড়া, কারণ সে অলরেডি এই সার্ভিসের ভেতরেই আছে)
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ৪. অপ্রয়োজনীয় ডেভ-ডিপেন্ডেন্সি বাদ দেওয়া
RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "dist/main.js"]