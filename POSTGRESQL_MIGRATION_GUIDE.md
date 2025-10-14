# PostgreSQL Migration Guide

## Overview

DAMOCLES currently uses SQLite for development, but **PostgreSQL is REQUIRED for production**. SQLite cannot handle multiple concurrent users and will cause data corruption in production.

## Why PostgreSQL?

- ✅ Supports concurrent connections
- ✅ Better performance with large datasets
- ✅ ACID compliance for financial data
- ✅ Advanced indexing and query optimization
- ✅ Full-text search capabilities
- ✅ JSON/JSONB support for flexible schemas

## Migration Steps

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Docker (Recommended for Development):**
```bash
docker run --name damocles-postgres \
  -e POSTGRES_USER=damocles_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=damocles_dev \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create user and database
CREATE USER damocles_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE damocles_dev OWNER damocles_user;
GRANT ALL PRIVILEGES ON DATABASE damocles_dev TO damocles_user;

# Exit psql
\q
```

### 3. Update Environment Variables

**Development (.env):**
```env
# OLD (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# NEW (PostgreSQL)
DATABASE_URL="postgresql://damocles_user:your_secure_password@localhost:5432/damocles_dev"
```

**Production (.env.production):**
```env
DATABASE_URL="postgresql://damocles_user:STRONG_PASSWORD@your-db-host:5432/damocles_prod"
```

### 4. Update Prisma Schema (if needed)

The schema in `services/user-service/prisma/schema.prisma` should already support PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5. Run Migrations

```bash
cd services/user-service

# Generate Prisma Client
npx prisma generate

# Create migration from schema
npx prisma migrate dev --name init_postgresql

# Or apply existing migrations
npx prisma migrate deploy
```

### 6. Migrate Data (Optional)

If you have existing data in SQLite you want to preserve:

```bash
# Export from SQLite
cd services/user-service
npx prisma db pull --schema=./prisma/schema.prisma
npx prisma db push

# Or use a data migration script
node scripts/migrate-sqlite-to-postgres.js
```

### 7. Verify Migration

```bash
# Check database connection
npx prisma studio

# Run a test query
psql postgresql://damocles_user:your_secure_password@localhost:5432/damocles_dev -c "SELECT * FROM \"User\" LIMIT 5;"
```

### 8. Update All Services

Update `.env` for all services that connect to the database:

- `services/user-service/.env`
- `services/gdpr-engine/.env` (if it connects directly)
- `apps/web/.env.local`

### 9. Restart Services

```bash
# Kill all running services
lsof -ti:3001,3002,8001 | xargs kill -9

# Restart with PostgreSQL
cd services/user-service && PORT=3001 npm run dev &
cd services/gdpr-engine && source venv/bin/activate && uvicorn main:app --port 8001 --reload &
cd apps/web && PORT=3002 npm run dev &
```

## Production Deployment

### Managed PostgreSQL Services

**Recommended options:**

1. **Neon** (https://neon.tech)
   - Serverless PostgreSQL
   - Generous free tier
   - Automatic scaling
   - Great for startups

2. **Supabase** (https://supabase.com)
   - PostgreSQL + real-time + storage
   - Free tier available
   - Built-in auth

3. **AWS RDS** (https://aws.amazon.com/rds/postgresql/)
   - Production-grade
   - Automated backups
   - Multi-AZ deployment

4. **DigitalOcean Managed Databases**
   - Simple pricing
   - Automated backups
   - Easy setup

### Production Configuration Example (Neon)

```env
# From Neon dashboard: https://console.neon.tech
DATABASE_URL="postgresql://damocles_user:RANDOM_PASSWORD@ep-quiet-voice-123456.eu-central-1.aws.neon.tech/damocles?sslmode=require"
```

### Security Best Practices

1. **Use SSL/TLS**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

2. **Connection Pooling** (for production)
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
   ```

3. **Read-Only Replicas** (for scaling)
   ```env
   DATABASE_URL="postgresql://user:pass@primary:5432/db"
   DATABASE_READ_URL="postgresql://user:pass@replica:5432/db"
   ```

4. **Automated Backups**
   - Enable daily automated backups
   - Test restore procedures monthly
   - Keep 30 days of backups minimum

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check if PostgreSQL is running
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Migration Failures

```bash
# Reset migrations (CAUTION: deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --create-only

# Apply specific migration
npx prisma migrate resolve --applied "20241213000001_migration_name"
```

### Performance Issues

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Analyze table statistics
ANALYZE VERBOSE "User";

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

## Data Backup Strategy

### Automated Daily Backups

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/var/backups/damocles"
DATE=$(date +%Y%m%d_%H%M%S)
DB_URL="postgresql://damocles_user:password@localhost:5432/damocles_prod"

# Create backup
pg_dump $DB_URL | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://damocles-backups/
```

Add to cron:
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-postgres.sh
```

### Restore from Backup

```bash
# Decompress and restore
gunzip < backup_20241213_020000.sql.gz | psql $DATABASE_URL
```

## Monitoring

### Key Metrics to Monitor

1. **Connection count**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Database size**
   ```sql
   SELECT pg_size_pretty(pg_database_size('damocles_prod'));
   ```

3. **Table sizes**
   ```sql
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

4. **Lock monitoring**
   ```sql
   SELECT * FROM pg_locks WHERE NOT granted;
   ```

## Checklist

- [ ] PostgreSQL installed and running
- [ ] Database and user created
- [ ] DATABASE_URL updated in all `.env` files
- [ ] Prisma schema updated to `provider = "postgresql"`
- [ ] Migrations run successfully (`npx prisma migrate deploy`)
- [ ] All services restarted with new connection
- [ ] Data migrated from SQLite (if applicable)
- [ ] Backups configured and tested
- [ ] Monitoring set up
- [ ] SSL/TLS enabled for production
- [ ] Connection pooling configured
- [ ] Performance indexes created

## Next Steps

After PostgreSQL migration is complete:

1. Set up automated backups
2. Configure monitoring (Sentry, DataDog, etc.)
3. Implement connection pooling (PgBouncer)
4. Set up read replicas for scaling
5. Configure high availability (Multi-AZ)

## Need Help?

- Prisma Docs: https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql
- PostgreSQL Docs: https://www.postgresql.org/docs/15/index.html
- Neon Quick Start: https://neon.tech/docs/get-started-with-neon/signing-up
