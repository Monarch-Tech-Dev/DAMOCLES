#!/bin/bash

# DAMOCLES Production Build Fix Script
# Run this on your production server to fix build issues

echo "🛡️  DAMOCLES Production Build Fix"
echo "=================================="
echo ""

# Stop PM2 process
echo "Stopping existing PM2 process..."
pm2 stop damocles-web 2>/dev/null || true
pm2 delete damocles-web 2>/dev/null || true

# Navigate to project
cd /root/DAMOCLES
echo "Pulling latest changes..."
git pull origin main

cd apps/web

# Clean build artifacts
echo "Cleaning old build..."
rm -rf .next

# Disable problematic routes temporarily
echo "Disabling problematic routes..."
[ -d app/widgets ] && mv app/widgets app/widgets.disabled 2>/dev/null || true
[ -d app/api/auth/vipps ] && mv app/api/auth/vipps app/api/auth/vipps.disabled 2>/dev/null || true

# Build
echo "Building production bundle..."
npm run build

# Check if build succeeded
if [ ! -f .next/BUILD_ID ]; then
    echo "❌ Build failed - BUILD_ID missing"
    exit 1
fi

# Create prerender manifest if missing
if [ ! -f .next/prerender-manifest.json ]; then
    echo "Creating prerender-manifest.json..."
    cat > .next/prerender-manifest.json << 'MANIFEST'
{
  "version": 4,
  "routes": {
    "/": {
      "initialRevalidateSeconds": false,
      "srcRoute": "/",
      "dataRoute": null
    }
  },
  "dynamicRoutes": {},
  "notFoundRoutes": [],
  "preview": {
    "previewModeId": "production",
    "previewModeSigningKey": "production",
    "previewModeEncryptionKey": "production"
  }
}
MANIFEST
fi

# Start with PM2
echo "Starting production server with PM2..."
pm2 start npm --name "damocles-web" --cwd /root/DAMOCLES/apps/web -- start -- --port 3000

# Save PM2 configuration
pm2 save

# Show status
echo ""
echo "✅ Production server started!"
pm2 status
echo ""
echo "View logs: pm2 logs damocles-web"
echo "Restart: pm2 restart damocles-web"
echo ""
