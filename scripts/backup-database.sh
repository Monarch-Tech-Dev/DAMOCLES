#!/bin/bash

# DAMOCLES Database Backup Script
# Backs up PostgreSQL database and uploads to remote storage (optional)

set -e  # Exit on error

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/root/damocles-backups}"
DB_NAME="${DB_NAME:-damocles}"
DB_USER="${DB_USER:-damocles_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"  # Keep backups for 7 days

# Backup filename
BACKUP_FILE="${BACKUP_DIR}/damocles_${TIMESTAMP}.sql.gz"
LATEST_LINK="${BACKUP_DIR}/latest.sql.gz"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== DAMOCLES Database Backup ===${NC}"
echo "Timestamp: $(date)"
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform the backup
echo -e "${YELLOW}Creating backup...${NC}"
if PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-owner \
  --no-acl \
  -F p | gzip > "${BACKUP_FILE}"; then

  echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}${NC}"

  # Get file size
  SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "Backup size: ${SIZE}"

  # Update latest symlink
  ln -sf "${BACKUP_FILE}" "${LATEST_LINK}"
  echo -e "${GREEN}✅ Latest backup link updated${NC}"

else
  echo -e "${RED}❌ Backup failed!${NC}"
  exit 1
fi

# Delete old backups
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_DIR}" -name "damocles_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
OLD_COUNT=$(find "${BACKUP_DIR}" -name "damocles_*.sql.gz" -type f | wc -l)
echo "Backups retained: ${OLD_COUNT}"

# Optional: Upload to remote storage (S3, DigitalOcean Spaces, etc.)
if [ -n "${BACKUP_S3_BUCKET}" ]; then
  echo -e "${YELLOW}Uploading to S3...${NC}"
  if command -v aws &> /dev/null; then
    aws s3 cp "${BACKUP_FILE}" "s3://${BACKUP_S3_BUCKET}/damocles-backups/" && \
      echo -e "${GREEN}✅ Uploaded to S3${NC}"
  else
    echo -e "${YELLOW}⚠️  AWS CLI not installed, skipping S3 upload${NC}"
  fi
fi

# Optional: Send notification
if [ -n "${BACKUP_WEBHOOK_URL}" ]; then
  curl -X POST "${BACKUP_WEBHOOK_URL}" \
    -H "Content-Type: application/json" \
    -d "{\"text\":\"✅ DAMOCLES database backup completed: ${BACKUP_FILE}\",\"size\":\"${SIZE}\"}" \
    2>/dev/null || true
fi

echo -e "${GREEN}=== Backup Complete ===${NC}"
echo "Latest backup: ${LATEST_LINK}"
echo ""

# Show last 5 backups
echo "Recent backups:"
ls -lht "${BACKUP_DIR}"/damocles_*.sql.gz 2>/dev/null | head -5 || echo "No backups found"

exit 0
