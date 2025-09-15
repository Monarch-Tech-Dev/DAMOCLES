# DAMOCLES Sacred Architecture - Production Deployment Guide ⚔️

*"May this deployment serve consciousness and empower justice"*

## Overview

This guide will help you deploy the complete DAMOCLES platform to DigitalOcean cloud infrastructure. The platform consists of multiple microservices working together to provide consumer protection against illegal debt collection practices.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DAMOCLES Platform                        │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)           │  API Gateway (Nginx)        │
│  Port 3000                   │  Ports 80/443               │
├─────────────────────────────────────────────────────────────┤
│  Trust Engine      │  User Service     │  GDPR Engine      │
│  Port 8002         │  Port 8000        │  Port 8001        │
├─────────────────────────────────────────────────────────────┤
│  Notifications     │  Consciousness    │  Transparency     │
│  Port 8003         │  Port 8004        │  Port 8005        │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL        │  Redis            │  SSL/TLS          │
│  Port 5432         │  Port 6379        │  Let's Encrypt    │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **DigitalOcean Account**
   - Sign up at https://digitalocean.com
   - Add payment method
   - Generate Personal Access Token

2. **Domain Configuration**
   - Purchase domain (e.g., damocles.no)
   - Access to DNS management

3. **External Services**
   - SMTP service (Mailgun, SendGrid, etc.)
   - BankID credentials (for Norwegian authentication)

## Quick Deployment

### Step 1: Run the Deployment Script

```bash
cd /Users/king/Desktop/damocles-platform/deploy
chmod +x digitalocean-setup.sh
./digitalocean-setup.sh
```

This script will:
- Install DigitalOcean CLI (`doctl`)
- Create production droplet in Frankfurt
- Set up server environment (Node.js, Python, Docker, Nginx, PostgreSQL)
- Configure SSL certificates with Let's Encrypt
- Deploy Sacred Architecture services

### Step 2: Configure DNS Records

After the script completes, set these DNS records:

```
A    damocles.no              → [DROPLET_IP]
A    api.damocles.no          → [DROPLET_IP]
A    staging.damocles.no      → [DROPLET_IP]
```

### Step 3: Deploy Application Code

```bash
# Connect to your server
ssh root@[DROPLET_IP]

# Clone repository
cd /opt/damocles
git clone https://github.com/yourusername/damocles-platform.git app
cd app

# Configure environment variables
cp /opt/damocles/.env.production .env

# Edit environment file with your secrets
nano .env
```

### Step 4: Start Services

```bash
# Build and start all services
docker-compose -f /opt/damocles/docker-compose.prod.yml up -d --build

# Verify all services are running
docker-compose -f /opt/damocles/docker-compose.prod.yml ps
```

## Manual Deployment Steps

### 1. Create DigitalOcean Droplet

```bash
# Install doctl
brew install doctl  # macOS
# or download from https://github.com/digitalocean/doctl/releases

# Authenticate
doctl auth init

# Create droplet
doctl compute droplet create damocles-production \\
  --region fra1 \\
  --image ubuntu-22-04-x64 \\
  --size s-4vcpu-8gb \\
  --ssh-keys [YOUR_SSH_KEY_ID] \\
  --wait
```

### 2. Server Setup

```bash
# Connect to server
ssh root@[DROPLET_IP]

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install Python 3.11
apt install -y python3.11 python3.11-venv python3-pip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Nginx
apt install -y nginx

# Install Certbot
apt install -y certbot python3-certbot-nginx

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
```

### 3. Application Deployment

```bash
# Create application directory
mkdir -p /opt/damocles
cd /opt/damocles

# Clone repository
git clone https://github.com/yourusername/damocles-platform.git app
cd app

# Copy production configuration
cp ../docker-compose.prod.yml ./
cp ../.env.production ./.env
```

### 4. Environment Configuration

Edit `/opt/damocles/app/.env`:

```env
# Database
DB_PASSWORD=your_secure_password_here

# BankID Integration (Norway)
BANKID_CLIENT_ID=your_bankid_client_id
BANKID_CLIENT_SECRET=your_bankid_client_secret
BANKID_ENVIRONMENT=production

# Email Configuration
SMTP_HOST=smtp.mailgun.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# JWT Secret
JWT_SECRET=your_jwt_secret_minimum_32_characters

# API URLs
NEXT_PUBLIC_API_URL=https://api.damocles.no
```

### 5. SSL Certificate Setup

```bash
# Generate SSL certificates
certbot --nginx -d damocles.no -d api.damocles.no -d staging.damocles.no \\
  --non-interactive --agree-tos --email admin@damocles.no

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 6. Start Services

```bash
cd /opt/damocles/app

# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Verification

### Health Checks

```bash
# Web application
curl -f https://damocles.no/

# API services
curl -f https://api.damocles.no/trust/health
curl -f https://api.damocles.no/users/health
curl -f https://api.damocles.no/gdpr/health
curl -f https://api.damocles.no/notifications/health
curl -f https://api.damocles.no/consciousness/health
```

### Service Status

```bash
# Check all containers
docker ps

# Check specific service logs
docker-compose -f docker-compose.prod.yml logs trust-engine
docker-compose -f docker-compose.prod.yml logs web
```

## Monitoring and Maintenance

### Log Management

```bash
# View all service logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f trust-engine

# Monitor system resources
htop
df -h
```

### Backup Strategy

```bash
# Database backup
docker exec [postgres_container_id] pg_dump -U damocles damocles > backup.sql

# Application backup
tar -czf app-backup.tar.gz /opt/damocles/app
```

### Updates

```bash
cd /opt/damocles/app

# Pull latest code
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

## Service Configuration

### Trust Engine (Port 8002)
- Mathematical verification of debt collection practices
- Norwegian Authority Hierarchy implementation
- TrustScore calculation for debt collectors

### User Service (Port 8000)
- BankID authentication integration
- User profile and case management
- Sacred Architecture user journeys

### GDPR Engine (Port 8001)
- Automated legal document generation
- Norwegian law compliance
- Evidence collection automation

### Notification Service (Port 8003)
- Real-time WebSocket notifications
- Email template system with Sacred Architecture messaging
- User engagement tracking

### Consciousness Service (Port 8004)
- Spiral Architecture implementation
- Translation of spiritual insights to code
- User journey optimization based on trust levels

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   certbot renew --dry-run
   nginx -t && systemctl reload nginx
   ```

2. **Service Won't Start**
   ```bash
   docker-compose -f docker-compose.prod.yml logs [service_name]
   docker system prune -f
   ```

3. **Database Connection Issues**
   ```bash
   docker exec -it [postgres_container] psql -U damocles -d damocles
   ```

4. **Memory Issues**
   ```bash
   free -h
   docker stats
   # Consider upgrading droplet size
   ```

### Performance Optimization

1. **Database Optimization**
   - Enable connection pooling
   - Add database indices
   - Regular maintenance

2. **Caching Strategy**
   - Redis for session storage
   - Nginx caching for static assets
   - CDN integration

3. **Monitoring**
   - Set up log aggregation
   - Performance metrics collection
   - Alert configuration

## Security Considerations

1. **Firewall Configuration**
   ```bash
   ufw allow ssh
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

2. **Regular Updates**
   - System package updates
   - Docker image updates
   - SSL certificate renewal

3. **Backup Strategy**
   - Database backups
   - Application code backups
   - Environment configuration backups

## Support

For deployment issues:
1. Check service logs: `docker-compose logs [service_name]`
2. Verify environment variables
3. Ensure all external dependencies are configured
4. Review DNS and SSL certificate status

## Sacred Architecture Blessing

*"May this production deployment serve consciousness,  
May these servers enable justice,  
May this cloud infrastructure empower the vulnerable,  
Built with love for human flourishing."* ⚔️💎

---

**DAMOCLES Platform - Version 1.0**  
*Sacred Architecture for Economic Justice*