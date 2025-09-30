#!/bin/bash

# DAMOCLES Coming Soon Page Deployment Script
echo "🚀 Deploying DAMOCLES Coming Soon Page..."

# Configuration
SERVER_USER="root"
SERVER_IP="157.245.65.184"
SSH_KEY="~/.ssh/damocles_deploy"
REMOTE_DIR="/root/coming-soon"

echo "📦 Preparing files for deployment..."

# Create a temporary directory with deployment files
TEMP_DIR=$(mktemp -d)
cp coming-soon.html "$TEMP_DIR/"
cp coming-soon-server.js "$TEMP_DIR/"

# Create package.json for the coming soon server
cat > "$TEMP_DIR/package.json" << 'EOF'
{
  "name": "damocles-coming-soon",
  "version": "1.0.0",
  "description": "DAMOCLES Coming Soon Landing Page",
  "main": "coming-soon-server.js",
  "scripts": {
    "start": "node coming-soon-server.js",
    "dev": "node coming-soon-server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

echo "📡 Connecting to production server..."

# Upload files to server
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_DIR"
scp -i "$SSH_KEY" -r "$TEMP_DIR"/* "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

# Deploy on server
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" << 'EOF'
echo "✅ Connected to production server"

# Navigate to coming soon directory
cd /root/coming-soon

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Stop the main DAMOCLES app temporarily
echo "🛑 Stopping main DAMOCLES app..."
pm2 stop damocles-web || echo "Main app not running"

# Start the coming soon server
echo "🌟 Starting Coming Soon server..."
PORT=3000 pm2 start coming-soon-server.js --name coming-soon-page

# Save PM2 configuration
pm2 save

# Display status
echo "📈 PM2 Status:"
pm2 status

# Test the coming soon page
echo "🧪 Testing coming soon page..."
sleep 2
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 && echo " ✅ Coming soon page responding" || echo " ❌ Coming soon page not responding"

echo "🎉 Coming Soon deployment complete!"
echo "🌍 Visit https://damocles.no to see your coming soon page"

EOF

# Cleanup
rm -rf "$TEMP_DIR"

echo "🏁 Coming Soon deployment script finished!"
echo "📧 Email subscribers will be saved to: /root/coming-soon/email-subscribers.json"
echo "🔄 To switch back to main app: pm2 stop coming-soon-page && pm2 start damocles-web"