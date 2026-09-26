#!/usr/bin/env bash
#
# Liveness watchdog for the tiny-VM BeMusic deployment.
#
# - Pings APP_URL every HEALTH_INTERVAL seconds (via cron). Treats ANY HTTP
#   response (even 4xx/5xx) as "up" - only timeouts/refusals count as failures.
# - After MAX_FAILURES consecutive failures: restarts php-fpm + nginx, and the
#   queue worker if present. Resets the counter afterwards.
# - Watches memory: when swap usage exceeds 50% or free RAM drops under
#   MIN_FREE_MB, logs a warning (an OOM risk on 0.75-2GB boxes).
#
# Notifications: optional HTTP webhook when HEALTH_WEBHOOK_URL is set
# (e.g. an email gateway or Slack/ntfy). Logs to /var/log/bemusic-health.log.
#
# Cron (installed by setup.sh):
#   */2 * * * * root deploy/healthcheck.sh

set -uo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${RUN_DIR:-/run}"
FAIL_FILE="$RUN_DIR/bemusic-health-failures"
LOG=/var/log/bemusic-health.log
MAX_FAILURES="${MAX_FAILURES:-5}"
MIN_FREE_MB="${MIN_FREE_MB:-100}"
HEALTH_WEBHOOK_URL="${HEALTH_WEBHOOK_URL:-}"

log() { echo "[$(date '+%F %T')] $*" >>"$LOG"; }

APP_URL="$(grep -E '^APP_URL=' "$APP_DIR/.env" 2>/dev/null | head -1 | cut -d= -f2- || true)"
APP_URL="${APP_URL:-http://127.0.0.1}"

notify() {
  [[ -z "$HEALTH_WEBHOOK_URL" ]] && return 0
  curl -s -m 10 -X POST -H 'Content-Type: text/plain' \
    --data-binary "$1" "$HEALTH_WEBHOOK_URL" >/dev/null 2>&1 || true
}

failures=0
[[ -f "$FAIL_FILE" ]] && failures="$(<"$FAIL_FILE" 2>/dev/null)"

# Any HTTP response (200-599) means nginx + php-fpm answered => healthy.
code="$(curl -s -m 20 -o /dev/null -w '%{http_code}' "$APP_URL" 2>/dev/null || echo 000)"
if [[ "$code" != "000" ]]; then
if (( failures > 0 )); then
    failures=0
    echo 0 >"$FAIL_FILE"
    log "recovered (HTTP $code)"
else
    log "OK (HTTP $code)"
fi
else
  failures=$((failures + 1))
  echo "$failures" >"$FAIL_FILE"
  log "connection failed ($failures/$MAX_FAILURES, target $APP_URL)"

  if (( failures >= MAX_FAILURES )); then
    log "restarting services..."
    systemctl restart php8.3-fpm nginx 2>>"$LOG" || true
    [[ -f /etc/systemd/system/bemusic-queue.service ]] \
      && systemctl restart bemusic-queue.service 2>>"$LOG" || true
    notify "BeMusic on $(hostname) was unreachable, restarted php-fpm/nginx"
    echo 0 >"$FAIL_FILE"
    failures=0
  fi
fi

# --- memory pressure watchdog ---------------------------------------------
read -r swap_total swap_used <<<"$(free -m | awk '/^Swap:/{print $2, $3}')"
read -r mem_total mem_used <<<"$(free -m | awk '/^Mem:/{print $2, $3}')"
if (( swap_total > 0 && (swap_used * 100 / swap_total) > 50 )); then
  log "WARNING: swap usage ${swap_used}MB/${swap_total}MB (>50%), free RAM ${mem_total - mem_used:-?}MB"
  notify "BeMusic on $(hostname): swap over 50% (${swap_used}MB), OOM risk on small VM"
fi
if (( mem_total - mem_used < MIN_FREE_MB )); then
  log "WARNING: free RAM under ${MIN_FREE_MB}MB (${mem_total - mem_used}MB)"
fi

exit 0