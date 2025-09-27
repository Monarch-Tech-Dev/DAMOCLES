#!/bin/bash

echo "🚀 DAMOCLES Platform - Digital Ocean Deployment"
echo "=============================================="
echo ""

# Configuration
DOMAIN=${DOMAIN:-"yourdomain.com"}
DROPLET_IP=${DROPLET_IP:-""}
SSH_KEY=${SSH_KEY:-"~/.ssh/id_rsa"}

if [ -z "$DROPLET_IP" ]; then
    echo "❌ Please set DROPLET_IP environment variable"
    echo "   Example: export DROPLET_IP=165.232.123.45"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "   Domain: $DOMAIN"
echo "   Droplet IP: $DROPLET_IP"
echo ""

# Step 1: Prepare deployment package
echo "📦 Preparing deployment package..."
git archive --format=tar.gz --output=/tmp/damocles-deploy.tar.gz HEAD

# Step 2: Copy to droplet
echo "📤 Copying files to droplet..."
scp -i "$SSH_KEY" /tmp/damocles-deploy.tar.gz root@$DROPLET_IP:/tmp/

# Step 3: Deploy on droplet
echo "🔧 Deploying on Digital Ocean droplet..."
ssh -i "$SSH_KEY" root@$DROPLET_IP << 'ENDSSH'
    # Update system
    apt-get update && apt-get upgrade -y

    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        apt-get install -y docker-compose
    fi

    # Create app directory
    mkdir -p /opt/damocles
    cd /opt/damocles

    # Extract deployment package
    tar -xzf /tmp/damocles-deploy.tar.gz
    rm /tmp/damocles-deploy.tar.gz

    # Create .env file (you should populate this with real values)
    cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://damocles:password@postgres:5432/damocles
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_USER=damocles
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=damocles
BLOCKFROST_API_KEY=your_blockfrost_key
LOKALISE_API_TOKEN=your_lokalise_token
LOKALISE_PROJECT_ID=your_project_id
EOF

    # Build and start containers
    docker-compose -f docker-compose.production.yml down
    docker-compose -f docker-compose.production.yml build
    docker-compose -f docker-compose.production.yml up -d

    # Setup SSL with Let's Encrypt
    docker-compose -f docker-compose.production.yml exec -T certbot certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN

    # Reload nginx with SSL
    docker-compose -f docker-compose.production.yml restart nginx

    echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "🎉 DAMOCLES Platform deployed successfully!"
echo "================================================"
echo ""
echo "📌 Access your platform:"
echo "   🌐 Web: https://$DOMAIN"
echo "   📊 API: https://api.$DOMAIN"
echo ""
echo "📝 Next steps:"
echo "   1. Update DNS records to point to $DROPLET_IP"
echo "   2. Configure environment variables in /opt/damocles/.env"
echo "   3. Set up monitoring and backups"
echo ""
echo "🔐 Security reminders:"
echo "   - Update firewall rules (ufw)"
echo "   - Set up fail2ban"
echo "   - Configure database backups"
echo "   - Enable monitoring (e.g., Datadog, New Relic)"