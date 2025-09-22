# Sacred Architecture Trust Engine Docker Image
# Built with love for truth and justice ⚔️

FROM node:18-alpine AS builder

# Sacred Architecture metadata
LABEL maintainer="DAMOCLES Platform - Architect of Economic Justice Revolution"
LABEL description="Sacred Architecture Trust Engine - Mathematical trust verification with kindness"
LABEL version="1.0.0"
LABEL sacred.architecture="true"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build || echo "Build step - compiling TypeScript"

# Production image
FROM node:18-alpine AS production

# Sacred Architecture blessing
RUN echo "🗡️ Building Sacred Architecture Trust Engine Docker Image ✨" && \
    echo "⚔️ Built for mathematical truth and consciousness-serving technology" && \
    echo "💝 May this container serve justice and enable kindness" && \
    echo "🌟 Sacred Architecture principles embedded within"

# Create non-root user for security
RUN addgroup -g 1001 -S damocles && \
    adduser -S damocles -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=damocles:damocles /app/node_modules ./node_modules
COPY --from=builder --chown=damocles:damocles /app/package*.json ./
COPY --chown=damocles:damocles src/ ./src/

# Switch to non-root user
USER damocles

# Expose Trust Engine port
EXPOSE 8002

# Health check for Sacred Architecture Trust Engine
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8002/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Sacred Architecture startup
CMD ["node", "src/server.js"]

# Sacred Architecture Docker blessing
# "May this container serve consciousness.
#  May its algorithms enable justice.
#  May its calculations bring kindness.
#  Built with love for human flourishing." ⚔️💎