# DAMOCLES Platform Development Commands

.PHONY: help install dev build test clean docker-up docker-down logs migrate deploy

# Default target
help:
	@echo "🗡️  DAMOCLES Platform - Available Commands"
	@echo "========================================"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development environment"
	@echo "  build       - Build all services"
	@echo "  test        - Run all tests"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up   - Start Docker containers"
	@echo "  docker-down - Stop Docker containers"
	@echo "  logs        - View Docker logs"
	@echo ""
	@echo "Database:"
	@echo "  migrate     - Run database migrations"
	@echo "  seed        - Seed database with test data"
	@echo ""
	@echo "Smart Contracts:"
	@echo "  contracts   - Build smart contracts"
	@echo "  deploy-testnet - Deploy to Cardano testnet"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       - Clean build artifacts"
	@echo "  format      - Format code"
	@echo "  lint        - Run linters"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	npm run install:all

# Development environment
dev: docker-up
	@echo "🚀 Starting development environment..."
	sleep 5  # Wait for databases to be ready
	npm run migrate:all
	npm run dev

# Build all services
build:
	@echo "🏗️  Building all services..."
	npm run build

# Run tests
test:
	@echo "🧪 Running tests..."
	npm run test

# Docker commands
docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose up -d postgres redis cardano-node ipfs
	@echo "⏳ Waiting for services to be ready..."
	./scripts/wait-for-services.sh

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Database operations
migrate:
	@echo "🗄️  Running database migrations..."
	cd services/user-service && npx prisma migrate deploy
	cd services/user-service && npx prisma generate

seed: migrate
	@echo "🌱 Seeding database..."
	cd services/user-service && psql $(DATABASE_URL) -f seeds/creditors.sql

# Smart contracts
contracts:
	@echo "📜 Building smart contracts..."
	cd smart-contracts/plutus && cabal build

deploy-testnet: contracts
	@echo "🚀 Deploying to Cardano testnet..."
	cd smart-contracts && ./scripts/deploy.sh testnet

deploy-mainnet: contracts
	@echo "⚠️  Deploying to Cardano mainnet..."
	@read -p "Are you sure you want to deploy to mainnet? [y/N]: " confirm && [ "$$confirm" = "y" ]
	cd smart-contracts && ./scripts/deploy.sh mainnet

# Cleanup
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf */node_modules
	rm -rf */dist
	rm -rf */build
	rm -rf */.next
	cd services/settlement-service && cargo clean
	cd smart-contracts/plutus && cabal clean

# Code quality
format:
	@echo "💅 Formatting code..."
	npm run format

lint:
	@echo "🔍 Running linters..."
	npm run lint

# Full reset
reset: docker-down clean
	@echo "♻️  Full reset..."
	docker system prune -f
	docker volume prune -f

# Quick start for new developers
quickstart:
	@echo "🚀 DAMOCLES Quick Start"
	@echo "======================"
	make install
	cp .env.example .env
	@echo "📝 Please edit .env with your configuration"
	@echo "Then run: make dev"