# DAMOCLES Deployment Guide 🚀

> **Environment:** Production Ready | **Updated:** December 2024

## 📋 **Prerequisites**

### System Requirements
- **Operating System:** Ubuntu 20.04+ or similar Linux distribution
- **Memory:** Minimum 4GB RAM (8GB recommended)
- **Storage:** 50GB SSD minimum
- **Network:** Public IP address with HTTPS capability

### Required Software
- **Node.js:** 18.x or higher
- **Python:** 3.9+ with pip
- **PostgreSQL:** 13+ (or managed database service)
- **Redis:** 6+ (or managed cache service)
- **Docker:** 20.10+ with Docker Compose
- **Nginx:** For reverse proxy and SSL termination

---

## 🏗️ **Architecture Overview**

### Production Stack
```
Internet → CloudFlare → Load Balancer → Nginx → Docker Containers
                                           ├── Web App (Next.js)
                                           ├── User Service (Node.js)
                                           ├── GDPR Engine (Python)
                                           └── Database + Redis
```

---

## ⚙️ **Environment Configuration**

### 1. **Create Environment Files**

#### **Production Environment** (`.env.production`)
```bash
# Application
NODE_ENV=production
APP_URL=https://damocles.no
API_URL=https://api.damocles.no
GDPR_API_URL=https://gdpr.damocles.no

# Database
DATABASE_URL=postgresql://damocles_user:secure_password@db.damocles.no:5432/damocles_prod
REDIS_URL=redis://cache.damocles.no:6379

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
BANKID_CLIENT_ID=your_bankid_client_id
BANKID_CLIENT_SECRET=your_bankid_client_secret
BANKID_ENVIRONMENT=production

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
FROM_EMAIL=noreply@damocles.no
FROM_NAME=DAMOCLES

# File Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=eu-north-1
AWS_BUCKET=damocles-documents

# Payment Processing
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoring
SENTRY_DSN=https://your_sentry_dsn
LOG_LEVEL=info

# Security
ENCRYPTION_KEY=your_32_char_encryption_key_here
SESSION_SECRET=your_session_secret_32_chars_min
CORS_ORIGIN=https://damocles.no,https://www.damocles.no

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_GDPR_AUTOMATION=true
ENABLE_TOKEN_REWARDS=true
```

### 2. **SSL Certificate Setup**

#### Using Let's Encrypt
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d damocles.no -d www.damocles.no -d api.damocles.no -d gdpr.damocles.no

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🐳 **Docker Deployment**

### 1. **Production Docker Compose**

Create `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - /var/log/nginx:/var/log/nginx
    depends_on:
      - web
      - user-service
      - gdpr-engine
    restart: unless-stopped

  # Web Application
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.damocles.no
      - NEXT_PUBLIC_GDPR_API_URL=https://gdpr.damocles.no
    volumes:
      - web-logs:/app/logs
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # User Service API
  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - user-service-logs:/app/logs
    depends_on:
      - database
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1024M
        reservations:
          memory: 512M

  # GDPR Engine
  gdpr-engine:
    build:
      context: ./services/gdpr-engine
      dockerfile: Dockerfile.prod
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=${DATABASE_URL}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    volumes:
      - gdpr-logs:/app/logs
      - gdpr-templates:/app/templates
    depends_on:
      - database
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1024M
        reservations:
          memory: 512M

  # Database
  database:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=damocles_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2048M
        reservations:
          memory: 1024M

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Backup Service
  backup:
    build: ./docker/backup
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - AWS_BUCKET=${AWS_BACKUP_BUCKET}
    volumes:
      - ./backups:/backups
      - postgres-data:/var/lib/postgresql/data:ro
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
  web-logs:
  user-service-logs:
  gdpr-logs:
  gdpr-templates:

networks:
  default:
    driver: bridge
```

### 2. **Nginx Configuration**

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream web_backend {
        server web:3000;
    }
    
    upstream api_backend {
        server user-service:3000;
    }
    
    upstream gdpr_backend {
        server gdpr-engine:8001;
    }

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=50r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Main Website
    server {
        listen 80;
        server_name damocles.no www.damocles.no;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name damocles.no www.damocles.no;

        ssl_certificate /etc/nginx/ssl/damocles.no.crt;
        ssl_certificate_key /etc/nginx/ssl/damocles.no.key;

        location / {
            limit_req zone=web burst=20 nodelay;
            proxy_pass http://web_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static Assets
        location /_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://web_backend;
        }
    }

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.damocles.no;

        ssl_certificate /etc/nginx/ssl/api.damocles.no.crt;
        ssl_certificate_key /etc/nginx/ssl/api.damocles.no.key;

        location / {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # GDPR Engine
    server {
        listen 443 ssl http2;
        server_name gdpr.damocles.no;

        ssl_certificate /etc/nginx/ssl/gdpr.damocles.no.crt;
        ssl_certificate_key /etc/nginx/ssl/gdpr.damocles.no.key;

        location / {
            limit_req zone=api burst=5 nodelay;
            proxy_pass http://gdpr_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 📦 **Dockerfile Configurations**

### Web App Dockerfile (`apps/web/Dockerfile.prod`)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/web ./apps/web

# Build application
RUN npm run build --workspace=apps/web

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "start", "--workspace=apps/web"]
```

### User Service Dockerfile (`services/user-service/Dockerfile.prod`)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY services/user-service/package*.json ./services/user-service/

RUN npm ci --only=production

COPY services/user-service ./services/user-service

RUN npm run build --workspace=services/user-service

FROM node:18-alpine AS runner

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S fastify -u 1001

COPY --from=builder --chown=fastify:nodejs /app/services/user-service/dist ./services/user-service/dist
COPY --from=builder --chown=fastify:nodejs /app/services/user-service/package.json ./services/user-service/
COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules

USER fastify

EXPOSE 3000

ENV NODE_ENV production

CMD ["node", "services/user-service/dist/server.js"]
```

---

## 🗄️ **Database Setup**

### 1. **Database Migration**
```bash
# Production database setup
cd services/user-service
npm run db:migrate:deploy
npm run db:seed:prod
```

### 2. **Database Backup Strategy**
```bash
#!/bin/bash
# backup.sh - Daily database backup script

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="your_database_url_here"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/damocles_backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/damocles_backup_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/damocles_backup_$TIMESTAMP.sql.gz s3://damocles-backups/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: damocles_backup_$TIMESTAMP.sql.gz"
```

---

## 🚀 **CI/CD Pipeline**

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: |
          npm run test
          npm run lint
          npm run type-check
      
      - name: Security audit
        run: |
          npm audit --audit-level=high
          npx snyk test

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Python security scan
        run: |
          pip install bandit safety
          bandit -r services/gdpr-engine
          safety check -r services/gdpr-engine/requirements.txt

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker images
        run: |
          docker build -f apps/web/Dockerfile.prod -t damocles-web .
          docker build -f services/user-service/Dockerfile.prod -t damocles-api .
          docker build -f services/gdpr-engine/Dockerfile.prod -t damocles-gdpr .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push damocles-web:latest
          docker push damocles-api:latest
          docker push damocles-gdpr:latest

  deploy:
    needs: [build]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/damocles
            docker-compose -f docker-compose.production.yml pull
            docker-compose -f docker-compose.production.yml up -d
            docker system prune -f

  smoke-test:
    needs: [deploy]
    runs-on: ubuntu-latest
    steps:
      - name: Health check
        run: |
          curl -f https://damocles.no/health || exit 1
          curl -f https://api.damocles.no/health || exit 1
          curl -f https://gdpr.damocles.no/health || exit 1
```

---

## 🔍 **Monitoring & Logging**

### 1. **Application Monitoring**

#### Health Check Endpoints
```javascript
// Health check implementation
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected', // Check DB connection
    redis: 'connected',    // Check Redis connection
    version: process.env.npm_package_version
  };
  
  res.json(health);
});
```

#### Logging Configuration
```javascript
// Winston logger setup
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### 2. **System Monitoring**

#### Prometheus & Grafana Setup
```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
```

---

## 🔒 **Security Hardening**

### 1. **Server Security**
```bash
# Firewall configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban setup
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. **Application Security**
```bash
# Security headers and rate limiting already configured in Nginx
# Additional security measures:

# 1. Regular security updates
sudo apt update && sudo apt upgrade

# 2. Docker security
docker run --security-opt no-new-privileges:true
docker run --read-only --tmpfs /tmp

# 3. Database security
# Use connection pooling with limited connections
# Enable SSL connections only
# Regular security patches
```

---

## 📊 **Performance Optimization**

### 1. **Application Performance**
```javascript
// Database connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis caching strategy
const cache = {
  ttl: 3600, // 1 hour
  
  async get(key) {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  },
  
  async set(key, value, ttl = this.ttl) {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
};
```

### 2. **CDN Configuration**
```bash
# CloudFlare settings
- Security Level: Medium
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- Browser Cache TTL: 1 month
- Edge Cache TTL: 2 hours
```

---

## 🚨 **Troubleshooting**

### Common Issues

#### Database Connection Issues
```bash
# Check database status
docker-compose logs database

# Check database connections
docker exec -it damocles_database_1 psql -U damocles_user -d damocles_prod -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Reset database connections
docker-compose restart database
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase container memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2048M
```

#### SSL Certificate Issues
```bash
# Renew certificates
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect damocles.no:443
```

---

## 📋 **Deployment Checklist**

### Pre-Deployment
- [ ] All environment variables configured
- [ ] SSL certificates installed and valid
- [ ] Database migrations tested
- [ ] Security scan completed
- [ ] Performance testing completed
- [ ] Backup strategy implemented
- [ ] Monitoring configured

### Deployment
- [ ] Code deployed to production
- [ ] Database migrations run
- [ ] Services health checks pass
- [ ] SSL/TLS working correctly
- [ ] CDN properly configured
- [ ] Monitoring systems operational

### Post-Deployment
- [ ] Application functionality verified
- [ ] Performance metrics baseline established
- [ ] Error tracking working
- [ ] Backup procedures tested
- [ ] Documentation updated
- [ ] Team notified of deployment

---

*From code to production - justice deployed at scale.* ⚔️