#!/bin/bash

# DAMOCLES Platform - Docker Startup Script
# Starts all services using Docker Compose

echo "🛡️  DAMOCLES Platform - Docker Launch"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.docker template..."
    cp .env.docker .env
    echo "✅ Created .env file. Please edit it with your real credentials."
    echo ""
fi

# Stop any running local dev servers (optional)
echo "🛑 Stopping any running local dev servers..."
pkill -f "PORT=3001" 2>/dev/null || true
pkill -f "PORT=3002" 2>/dev/null || true
pkill -f "PORT=3003" 2>/dev/null || true
pkill -f "PORT=8001" 2>/dev/null || true
pkill -f "PORT=8021" 2>/dev/null || true
pkill -f "PORT=3005" 2>/dev/null || true
pkill -f "PORT=3006" 2>/dev/null || true

echo ""
echo "🚀 Starting DAMOCLES services with Docker Compose..."
echo ""

# Start services
docker-compose up --build -d

echo ""
echo "✅ Services starting! Check status with: docker-compose ps"
echo ""
echo "📋 Service URLs:"
echo "   Frontend:          http://localhost:3002"
echo "   User Service:      http://localhost:3001"
echo "   Trust Engine:      http://localhost:3003"
echo "   GDPR Engine:       http://localhost:8001"
echo "   Blockchain:        http://localhost:8021"
echo "   Payment Service:   http://localhost:3006"
echo "   Notification:      http://localhost:3005"
echo "   PostgreSQL:        localhost:5432"
echo "   Redis:             localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "   docker-compose logs -f                 # View all logs"
echo "   docker-compose logs -f user-service    # View specific service"
echo "   docker-compose ps                       # Check service status"
echo "   docker-compose down                     # Stop all services"
echo "   docker-compose restart user-service     # Restart a service"
echo ""
