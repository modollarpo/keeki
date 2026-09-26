#!/usr/bin/env bash
#
# Daily backup for BeMusic: full MariaDB dump + app storage (uploads), kept
# for RETENTION days. Script is idempotent and safe to run any time.
#
# Cron (installed by setup.sh):
#   0 4 * * * root deploy/backup.sh
#
# Restore:
#   gunzip -c <db>.sql.gz | mysql bemusic
#   tar -xzf <storage>.tar.gz -C /var/www/bemusic

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/bemusic}"
RETENTION="${RETENTION:-14}"
STAMP="$(date +%F_%H%M)"

mkdir -p "$BACKUP_DIR"
LOG="$BACKUP_DIR/backup.log"

log() { echo "[$(date '+%F %T')] $*" >>"$LOG"; }

echo "Starting backup at $(date '+%F %T')" >>"$LOG"

# --- 1. MariaDB dump -------------------------------------------------------
DB_NAME="${DB_NAME:-bemusic}"
if ! mysqldump --single-transaction --quick --routines --triggers \
  "$DB_NAME" >"$BACKUP_DIR/db-$STAMP.sql" 2>>"$LOG"; then
  log "ERROR: mysqldump failed"
  rm -f "$BACKUP_DIR/db-$STAMP.sql"
  exit 1
fi
gzip -f "$BACKUP_DIR/db-$STAMP.sql"
log "database dump ok ($BACKUP_DIR/db-$STAMP.sql.gz)"

# --- 2. storage (uploads, thumbnails, edited views) -------------------------
if [[ -d "$APP_DIR/storage/app" ]] && ! find "$APP_DIR/storage/app" -mindepth 1 >/dev/null 2>&1; then
  log "storage/app is empty; skipping storage archive"
else
  tar -czf "$BACKUP_DIR/storage-$STAMP.tar.gz" -C "$APP_DIR" storage/ 2>>"$LOG" \
    || { log "ERROR: storage archive failed"; exit 1; }
  log "storage archive ok ($BACKUP_DIR/storage-$STAMP.tar.gz)"
fi

# --- 3. retention ----------------------------------------------------------
OLD="$(find "$BACKUP_DIR" -maxdepth 1 -name 'db-*.sql.gz' -mtime +"$RETENTION" | wc -l)"
find "$BACKUP_DIR" -maxdepth 1 \( -name 'db-*.sql.gz' -o -name 'storage-*.tar.gz' \) \
  -mtime +"$RETENTION" -delete
log "retention: removed $OLD old backup set(s) (keeping $RETENTION days)"

log "backup complete"
exit 0