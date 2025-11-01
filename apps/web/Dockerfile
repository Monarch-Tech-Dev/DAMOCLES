# Base stage - shared dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Development stage
FROM base AS development
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY services/user-service/package*.json ./services/user-service/
COPY services/user-service/prisma ./services/user-service/prisma
RUN npm install
COPY . .
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder stage for production
FROM base AS builder
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY services/user-service/package*.json ./services/user-service/
COPY services/user-service/prisma ./services/user-service/prisma
RUN npm install
RUN cd services/user-service && npx prisma generate
COPY apps/web ./apps/web
WORKDIR /app/apps/web
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets from builder
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000
WORKDIR /app/apps/web

# Use standalone server
CMD ["node", "server.js"]
