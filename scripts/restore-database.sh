#!/bin/bash

# DAMOCLES Database Restore Script
# Restores PostgreSQL database from backup

set -e  # Exit on error

# Configuration
DB_NAME="${DB_NAME:-damocles}"
DB_USER="${DB_USER:-damocles_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
BACKUP_DIR="${BACKUP_DIR:-/root/damocles-backups}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== DAMOCLES Database Restore ===${NC}"
echo ""

# Check if backup file provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}Usage: $0 <backup-file>${NC}"
  echo ""
  echo "Available backups:"
  ls -lht "${BACKUP_DIR}"/damocles_*.sql.gz 2>/dev/null | head -10 || echo "No backups found"
  echo ""
  echo "Or use 'latest' to restore from the most recent backup:"
  echo "  $0 latest"
  exit 1
fi

# Determine backup file
if [ "$1" == "latest" ]; then
  BACKUP_FILE="${BACKUP_DIR}/latest.sql.gz"
  if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ No latest backup found${NC}"
    exit 1
  fi
else
  BACKUP_FILE="$1"
  if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
  fi
fi

echo "Backup file: ${BACKUP_FILE}"
echo "Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
echo ""

# Confirmation
echo -e "${YELLOW}⚠️  WARNING: This will REPLACE all data in ${DB_NAME}!${NC}"
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

# Create a pre-restore backup
echo -e "${YELLOW}Creating pre-restore backup...${NC}"
PRE_RESTORE_BACKUP="${BACKUP_DIR}/pre-restore_$(date +"%Y%m%d_%H%M%S").sql.gz"
PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-acl \
  -F p | gzip > "${PRE_RESTORE_BACKUP}"
echo -e "${GREEN}✅ Pre-restore backup created: ${PRE_RESTORE_BACKUP}${NC}"

# Drop all tables
echo -e "${YELLOW}Dropping existing tables...${NC}"
PGPASSWORD="${DB_PASSWORD}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restore from backup
echo -e "${YELLOW}Restoring database...${NC}"
if gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -q; then

  echo -e "${GREEN}✅ Database restored successfully!${NC}"

  # Show database size
  SIZE=$(PGPASSWORD="${DB_PASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -t -c "SELECT pg_size_pretty(pg_database_size('${DB_NAME}'));")

  echo "Database size: ${SIZE}"

else
  echo -e "${RED}❌ Restore failed!${NC}"
  echo -e "${YELLOW}You can restore from pre-restore backup: ${PRE_RESTORE_BACKUP}${NC}"
  exit 1
fi

echo -e "${GREEN}=== Restore Complete ===${NC}"
exit 0
