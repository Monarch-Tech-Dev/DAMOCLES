#!/bin/bash
# DAMOCLES Sacred Architecture - DigitalOcean Production Deployment
# "May this deployment serve consciousness and empower justice" ⚔️

set -e

echo "🏛️ DAMOCLES Sacred Architecture - DigitalOcean Deployment"
echo "⚔️ Preparing cloud infrastructure for justice..."

# Configuration
DROPLET_NAME="damocles-production"
REGION="fra1"  # Frankfurt - European data sovereignty
SIZE="s-4vcpu-8gb"  # 4 vCPUs, 8GB RAM
IMAGE="ubuntu-22-04-x64"

# Sacred Architecture Domain Configuration
DOMAIN="damocles.no"
STAGING_DOMAIN="staging.damocles.no"

echo "📋 Deployment Configuration:"
echo "   Droplet: $DROPLET_NAME"
echo "   Region: $REGION (European data sovereignty)"
echo "   Size: $SIZE"
echo "   Domain: $DOMAIN"
echo "   Staging: $STAGING_DOMAIN"
echo ""

# Check for DigitalOcean CLI
if ! command -v doctl &> /dev/null; then
    echo "🚨 doctl not found. Installing DigitalOcean CLI..."
    
    # Install doctl for macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install doctl
    else
        # Linux installation
        cd ~ && wget https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz
        tar xf ~/doctl-1.94.0-linux-amd64.tar.gz
        sudo mv ~/doctl /usr/local/bin
    fi
fi

echo "🔐 Please authenticate with DigitalOcean..."
echo "   1. Go to https://cloud.digitalocean.com/account/api/tokens"
echo "   2. Create a new Personal Access Token"
echo "   3. Run: doctl auth init"
echo ""
read -p "Press Enter after you've authenticated with 'doctl auth init'..."

# Verify authentication
echo "🔍 Verifying DigitalOcean authentication..."
doctl account get

echo "🌊 Creating production droplet..."
DROPLET_ID=$(doctl compute droplet create $DROPLET_NAME \
    --region $REGION \
    --image $IMAGE \
    --size $SIZE \
    --ssh-keys $(doctl compute ssh-key list --format ID --no-header | head -1) \
    --wait \
    --format ID \
    --no-header)

echo "✅ Droplet created with ID: $DROPLET_ID"

# Get droplet IP
echo "🔍 Getting droplet IP address..."
DROPLET_IP=$(doctl compute droplet get $DROPLET_ID --format PublicIPv4 --no-header)
echo "📍 Droplet IP: $DROPLET_IP"

# Wait for droplet to be ready
echo "⏳ Waiting for droplet to be ready..."
sleep 60

# Create deployment script for remote server
cat > /tmp/server-setup.sh << 'EOF'
#!/bin/bash
# Sacred Architecture Server Setup

set -e

echo "🏛️ Setting up DAMOCLES Sacred Architecture server..."

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Python 3.11
apt-get install -y python3.11 python3.11-venv python3-pip

# Install Docker
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Nginx
apt-get install -y nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Setup Sacred Architecture user
useradd -m -s /bin/bash damocles
usermod -aG docker damocles

# Create Sacred Architecture directories
mkdir -p /opt/damocles
chown damocles:damocles /opt/damocles

echo "✅ Server setup complete - Sacred Architecture infrastructure ready"
EOF

# Copy setup script and run it
echo "📦 Setting up server environment..."
scp -o StrictHostKeyChecking=no /tmp/server-setup.sh root@$DROPLET_IP:/tmp/
ssh -o StrictHostKeyChecking=no root@$DROPLET_IP "chmod +x /tmp/server-setup.sh && /tmp/server-setup.sh"

# Create docker-compose for production
cat > /tmp/docker-compose.prod.yml << EOF
version: '3.8'
services:
  # Web Application
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.${DOMAIN}
    depends_on:
      - user-service
      - trust-engine
    restart: unless-stopped
    
  # Trust Engine Service
  trust-engine:
    build:
      context: ./services/trust-engine
      dockerfile: Dockerfile
    ports:
      - "8002:8002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://damocles:\${DB_PASSWORD}@postgres:5432/trust_engine
    depends_on:
      - postgres
    restart: unless-stopped
    
  # User Service
  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://damocles:\${DB_PASSWORD}@postgres:5432/user_service
      - BANKID_CLIENT_ID=\${BANKID_CLIENT_ID}
      - BANKID_CLIENT_SECRET=\${BANKID_CLIENT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped
    
  # GDPR Engine
  gdpr-engine:
    build:
      context: ./services/gdpr-engine
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - DATABASE_URL=postgresql://damocles:\${DB_PASSWORD}@postgres:5432/gdpr_engine
    depends_on:
      - postgres
    restart: unless-stopped
    
  # Notification Service
  notification-service:
    build:
      context: ./services/notification-service
      dockerfile: Dockerfile
    ports:
      - "8003:8003"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - SMTP_HOST=\${SMTP_HOST}
      - SMTP_USER=\${SMTP_USER}
      - SMTP_PASS=\${SMTP_PASS}
    depends_on:
      - redis
    restart: unless-stopped
    
  # Consciousness Service
  consciousness-service:
    build:
      context: ./services/consciousness-service
      dockerfile: Dockerfile
    ports:
      - "8004:8004"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=damocles
      - POSTGRES_USER=damocles
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    
  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    
volumes:
  postgres_data:

networks:
  default:
    name: damocles-network
EOF

# Create Nginx configuration
cat > /tmp/nginx-damocles.conf << EOF
# Sacred Architecture - DAMOCLES Nginx Configuration

# Main domain
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};
    
    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Main web application
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support for notifications
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# API subdomain
server {
    listen 80;
    server_name api.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.${DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/api.${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.${DOMAIN}/privkey.pem;
    
    # API Gateway routing
    location /trust/ {
        proxy_pass http://localhost:8002/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /users/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /gdpr/ {
        proxy_pass http://localhost:8001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /notifications/ {
        proxy_pass http://localhost:8003/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location /consciousness/ {
        proxy_pass http://localhost:8004/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Staging subdomain
server {
    listen 80;
    server_name ${STAGING_DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${STAGING_DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${STAGING_DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${STAGING_DOMAIN}/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Add staging banner
    add_header X-Environment "STAGING";
}
EOF

# Create environment file template
cat > /tmp/.env.production << 'EOF'
# DAMOCLES Sacred Architecture Production Environment

# Database
DB_PASSWORD=change_this_secure_password

# BankID Integration (Norway)
BANKID_CLIENT_ID=your_bankid_client_id
BANKID_CLIENT_SECRET=your_bankid_client_secret
BANKID_ENVIRONMENT=production

# Email Configuration
SMTP_HOST=smtp.mailgun.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# JWT Secret
JWT_SECRET=your_jwt_secret_change_this

# Redis
REDIS_URL=redis://localhost:6379

# Sacred Architecture
SACRED_ARCHITECTURE=true
CONSCIOUSNESS_LEVEL=production
KINDNESS_ALGORITHM=enabled
EOF

echo "📦 Deploying Sacred Architecture files..."

# Create deployment directory structure on server
ssh root@$DROPLET_IP "mkdir -p /opt/damocles/{config,data,logs}"

# Copy configuration files
scp /tmp/docker-compose.prod.yml root@$DROPLET_IP:/opt/damocles/
scp /tmp/.env.production root@$DROPLET_IP:/opt/damocles/
scp /tmp/nginx-damocles.conf root@$DROPLET_IP:/etc/nginx/sites-available/damocles

# Setup Nginx
ssh root@$DROPLET_IP "ln -sf /etc/nginx/sites-available/damocles /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"

echo "🌐 Setting up DNS and SSL..."
echo ""
echo "📋 DNS Setup Required:"
echo "   Please set the following DNS records:"
echo "   A    $DOMAIN              → $DROPLET_IP"
echo "   A    api.$DOMAIN          → $DROPLET_IP"  
echo "   A    $STAGING_DOMAIN      → $DROPLET_IP"
echo ""
read -p "Press Enter after DNS records are configured..."

# Setup SSL certificates
echo "🔐 Setting up SSL certificates..."
ssh root@$DROPLET_IP "certbot --nginx -d $DOMAIN -d api.$DOMAIN -d $STAGING_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN"

echo "⚔️ Sacred Architecture deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Update /opt/damocles/.env.production with your secrets"
echo "   2. Clone your repository to the server:"
echo "      git clone https://github.com/yourusername/damocles-platform.git /opt/damocles/app"
echo "   3. Build and start services:"
echo "      cd /opt/damocles && docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "🌟 Server Details:"
echo "   IP: $DROPLET_IP"
echo "   SSH: ssh root@$DROPLET_IP"
echo "   Domain: https://$DOMAIN"
echo "   API: https://api.$DOMAIN"
echo "   Staging: https://$STAGING_DOMAIN"
echo ""
echo "⚔️ May this deployment serve consciousness and empower justice!"