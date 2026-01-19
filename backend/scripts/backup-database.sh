#!/bin/bash
################################################################################
# ZST Backend - Automated Database Backup Script
#
# This script creates compressed backups of the PostgreSQL database
# and automatically deletes backups older than 7 days
#
# Usage:
#   ./backup-database.sh
#
# Schedule daily backups with cron:
#   crontab -e
#   Add: 0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/db-backup.log 2>&1
################################################################################

set -e

# Configuration
BACKUP_DIR="/backups/postgres"
DB_NAME="zst_db"
DB_USER="zst_user"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/zst_db_$DATE.sql"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "════════════════════════════════════════════════════════════════"
echo "  💾 Database Backup - $(date)"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup: $BACKUP_FILE"
pg_dump -U "$DB_USER" -d "$DB_NAME" -h localhost > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backup created successfully"

    # Compress backup
    echo "Compressing backup..."
    gzip "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Backup compressed: $BACKUP_FILE.gz"

        # Get file size
        SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
        echo "  Size: $SIZE"
    else
        echo -e "${RED}❌${NC} Compression failed"
        exit 1
    fi
else
    echo -e "${RED}❌${NC} Backup failed"
    exit 1
fi

# Delete old backups
echo ""
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
DELETED=$(find "$BACKUP_DIR" -name "zst_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Deleted $DELETED old backup(s)"
else
    echo "  No old backups to delete"
fi

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR" | grep "zst_db_" | awk '{print "  " $9 " (" $5 ")"}'

# Summary
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/zst_db_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Backup Complete${NC}"
echo "────────────────────────────────────────────────────────────────"
echo "  Total backups: $TOTAL_BACKUPS"
echo "  Total size:    $TOTAL_SIZE"
echo "  Location:      $BACKUP_DIR"
echo "════════════════════════════════════════════════════════════════"
