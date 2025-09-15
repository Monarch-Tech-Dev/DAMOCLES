# DAMOCLES Consciousness Service - Sacred Architecture Spiral Intelligence
# Translation of spiritual insights into practical code

FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S damocles
RUN adduser -S damocles -u 1001 -G damocles

# Change ownership of the app directory
RUN chown -R damocles:damocles /app
USER damocles

# Sacred Architecture environment
ENV NODE_ENV=production
ENV SACRED_ARCHITECTURE=true
ENV CONSCIOUSNESS_LEVEL=production
ENV CONSCIOUSNESS_PORT=8004

EXPOSE 8004

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8004/health || exit 1

CMD ["npm", "start"]