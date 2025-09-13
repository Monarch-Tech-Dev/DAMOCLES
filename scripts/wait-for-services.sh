#!/bin/bash

# Wait for services to be ready
set -e

echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL
echo "🐘 Waiting for PostgreSQL..."
until docker-compose exec postgres pg_isready -U damocles_user > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL is ready"

# Wait for Redis
echo "🔴 Waiting for Redis..."
until docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
  sleep 1
done  
echo "✅ Redis is ready"

# Wait for IPFS (check if API is responding)
echo "📁 Waiting for IPFS..."
until curl -f http://localhost:5001/api/v0/version > /dev/null 2>&1; do
  sleep 1
done
echo "✅ IPFS is ready"

# Check Cardano node (this may take longer)
echo "₳  Checking Cardano node..."
# Note: Cardano node takes much longer to sync, this is just a basic check
if curl -f http://localhost:3001 > /dev/null 2>&1; then
  echo "✅ Cardano node is responding"
else
  echo "⚠️  Cardano node may still be starting (this is normal)"
fi

echo "🎉 Core services are ready!"
echo "📝 You can now run database migrations and start the application"