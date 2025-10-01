# DAMOCLES Docker Setup 🐳

Run the entire DAMOCLES platform with a single command using Docker Compose.

## Quick Start

```bash
# 1. Start all services
./docker-start.sh

# 2. Access the platform
open http://localhost:3002
```

That's it! All 7 microservices + database + cache are running.

## What Gets Started

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 3002 | Next.js web application |
| **User Service** | 3001 | Authentication & user management |
| **GDPR Engine** | 8001 | GDPR request generation (Python) |
| **Trust Engine** | 3003 | Creditor risk analysis |
| **Blockchain Service** | 8021 | Cardano evidence timestamping |
| **Payment Service** | 3006 | Stripe payment processing |
| **Notification Service** | 3005 | Email & WebSocket notifications |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Caching & sessions |

## Manual Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Check service status
docker-compose ps

# Restart a single service
docker-compose restart user-service

# Access database
docker exec -it damocles-postgres psql -U damocles_user -d damocles
```

## Environment Variables

Edit `.env` file to configure:
- Database password
- JWT secrets
- Vipps credentials
- Stripe keys
- Email SMTP settings
- Cardano blockchain settings

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:

```bash
# Stop local dev servers
pkill -f "PORT=3001"
pkill -f "PORT=3002"

# Or specify different ports in docker-compose.yml
```

### Database Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
docker exec -it damocles-postgres psql -U damocles_user -d damocles
```

### View Service Health
```bash
curl http://localhost:3001/health  # User Service
curl http://localhost:8001/health  # GDPR Engine
curl http://localhost:3003/health  # Trust Engine
```

## Development Workflow

```bash
# 1. Make code changes (auto-reloads with volume mounts)
# 2. View logs: docker-compose logs -f service-name
# 3. Restart if needed: docker-compose restart service-name
```

## Production Deployment

For production, use:
- Managed Postgres (Supabase, AWS RDS)
- Managed Redis (Redis Cloud, AWS ElastiCache)
- Container hosting (Vercel, Railway, AWS ECS)
- Update `.env` with production secrets

## Benefits of Docker Setup

✅ **No TypeScript version conflicts**  
✅ **No Python environment issues**  
✅ **Consistent across all machines**  
✅ **Easy to deploy to cloud**  
✅ **All services isolated**  
✅ **Database & cache included**  
✅ **One command startup**  

## Next Steps

1. Configure `.env` with your credentials
2. Run `./docker-start.sh`
3. Open http://localhost:3002
4. Create a test account
5. Start using DAMOCLES!
