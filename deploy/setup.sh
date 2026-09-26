#!/usr/bin/env bash
#
# BeMusic provisioning for a single free Azure VM (Ubuntu 24.04 LTS, x64 or ARM64).
# No Docker required. Installs nginx + PHP-FPM + MariaDB + Redis, configures the
# app, installs the queue worker and connects the built front-end (public/build).
#
# Usage:  sudo bash deploy/setup.sh [https://your-domain.com]
#   When run without an argument, APP_URL defaults to http://<primary-ip>.
#
# After this script finishes, open http://<ip>/install and complete the built-in
# web installer (it creates the admin account and seeds the database).

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$APP_DIR/deploy"

if [[ $EUID -ne 0 ]]; then
  echo "ERROR: run as root (sudo bash deploy/setup.sh)" >&2
  exit 1
fi

if [[ ! -f "$APP_DIR/artisan" ]]; then
  echo "ERROR: deploy/setup.sh must live inside the app: <app>/deploy/setup.sh" >&2
  exit 1
fi

# --- resolve APP_URL -------------------------------------------------------
if [[ -n "${1:-}" ]]; then
  APP_URL="$1"
else
  # Prefer Azure IMDS public IP (hostname -I returns the private IP on a VM).
  PUBLIC_IP="$(curl -s --noproxy '*' \
    -H 'Metadata: true' \
    'http://169.254.169.254/metadata/instance/network/interface/0/ipv4/ipAddress/0/publicIpAddress?api-version=2021-02-01&format=text' 2>/dev/null || true)"
  IP="${PUBLIC_IP:-$(hostname -I | awk '{print $1}')}"
  APP_URL="http://${IP:-127.0.0.1}"
fi
echo "==> APP_URL will be: $APP_URL"

# --- install packages ------------------------------------------------------
echo "==> Installing system packages (this takes a few minutes)..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  nginx \
  mariadb-server \
  redis-server \
  php8.3-cli php8.3-fpm \
  php8.3-mysql php8.3-redis php8.3-gd \
  php8.3-xml php8.3-mbstring php8.3-intl \
  php8.3-zip php8.3-bcmath php8.3-curl \
  unzip openssl ca-certificates \
  >/dev/null

systemctl enable --now mariadb redis-server php8.3-fpm nginx >/dev/null 2>&1 || true

# --- Meilisearch (full-text search engine, local service on 127.0.0.1:7700) --
echo "==> Installing Meilisearch..."
MEILI_KEY="$(openssl rand -hex 24)"
if [[ ! -x /usr/local/bin/meilisearch ]]; then
  # The official installer drops the binary in the current directory.
  _tmp="$(mktemp -d)"
  (cd "$_tmp" && curl -sL https://install.meilisearch.com | sh >/dev/null)
  install -m 0755 "$_tmp/meilisearch" /usr/local/bin/meilisearch
  rm -rf "$_tmp"
fi
id meilisearch >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin meilisearch
install -d -o meilisearch -g meilisearch /var/lib/meilisearch/data
printf 'MEILI_MASTER_KEY=%s\n' "$MEILI_KEY" > /etc/meilisearch.env
chown root:root /etc/meilisearch.env
chmod 600 /etc/meilisearch.env
# WorkingDirectory matters: Meilisearch creates ./dumps relative to its cwd.
cat > /etc/systemd/system/meilisearch.service <<'UNIT'
[Unit]
Description=Meilisearch
After=network.target

[Service]
User=meilisearch
Group=meilisearch
WorkingDirectory=/var/lib/meilisearch
EnvironmentFile=/etc/meilisearch.env
ExecStart=/usr/local/bin/meilisearch --http-addr 127.0.0.1:7700 --env production --db-path /var/lib/meilisearch/data
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now meilisearch >/dev/null 2>&1 || true
sleep 3
curl -s http://127.0.0.1:7700/health >/dev/null 2>&1 || echo "WARNING: Meilisearch health check failed" >&2

# --- small-VM memory tuning (free-tier/B-series boxes can OOM-hang) ----------
echo "==> Applying memory tuning for small VMs..."
TOTAL_MEM_MB="$(free -m | awk '/^Mem:/{print $2}')"
echo "   total RAM: ${TOTAL_MEM_MB}MB"
if [[ "$TOTAL_MEM_MB" -lt 2000 ]]; then
  # 2GB swapfile as an OOM safety net
  if ! swapon --show | grep -q '/swapfile'; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile >/dev/null
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
  echo "   2G swap enabled"
fi

# cap Meilisearch memory
mkdir -p /etc/systemd/system/meilisearch.service.d
cat > /etc/systemd/system/meilisearch.service.d/override.conf <<'UNIT'
[Service]
MemoryHigh=256M
MemoryMax=384M
UNIT
systemctl daemon-reload

# trim MariaDB footprint
cat > /etc/mysql/mariadb.conf.d/99-bemusic.cnf <<'UNIT'
[mysqld]
performance_schema = OFF
innodb_buffer_pool_size = 64M
key_buffer_size = 4M
max_connections = 50
UNIT

# cap php-fpm workers
cat > /etc/php/8.3/fpm/pool.d/www.conf <<'UNIT'
[www]
user = www-data
group = www-data
listen = /run/php/php8.3-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = dynamic
pm.max_children = 4
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
UNIT

# --- PHP settings for large media uploads ----------------------------------
for ini in /etc/php/8.3/fpm/php.ini /etc/php/8.3/cli/php.ini; do
  sed -i 's/^upload_max_filesize.*/upload_max_filesize = 2048M/'   "$ini"
  sed -i 's/^post_max_size.*/post_max_size = 2048M/'              "$ini"
  sed -i 's/^max_execution_time.*/max_execution_time = 600/'      "$ini"
  sed -i 's/^memory_limit.*/memory_limit = 1024M/'                "$ini"
done
systemctl restart php8.3-fpm >/dev/null

# --- MariaDB database + user ------------------------------------------------
echo "==> Creating database and user..."
DB_PASS="$(openssl rand -hex 20)"
mysql -e "CREATE DATABASE IF NOT EXISTS bemusic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'bemusic'@'%' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON bemusic.* TO 'bemusic'@'%';"
mysql -e "FLUSH PRIVILEGES;"

# --- .env -------------------------------------------------------------------
echo "==> Writing .env"
if [[ -f "$APP_DIR/.env" ]]; then
  cp "$APP_DIR/.env" "$APP_DIR/.env.backup.$(date +%s)"
fi
cp "$DEPLOY_DIR/env.production" "$APP_DIR/.env"
sed -i "s|__APP_URL__|$APP_URL|g"           "$APP_DIR/.env"
sed -i "s|__DB_PASSWORD__|$DB_PASS|g"       "$APP_DIR/.env"
sed -i "s|__MEILISEARCH_KEY__|$MEILI_KEY|g" "$APP_DIR/.env"
sed -i "s|__APP_KEY__||g"                   "$APP_DIR/.env"

echo "==> Generating APP_KEY..."
php "$APP_DIR/artisan" key:generate --force

# --- permissions & storage link --------------------------------------------
echo "==> Setting file permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R u+rwX "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

echo "==> Linking storage (uploaded media) to public/..."
rm -rf "$APP_DIR/public/storage"
sudo -u www-data php "$APP_DIR/artisan" storage:link

echo "==> Clearing stale caches..."
sudo -u www-data php "$APP_DIR/artisan" optimize:clear >/dev/null 2>&1 || true
rm -f "$APP_DIR/public/hot"

# Metadata provider defaults to Deezer: Spotify search requires a premium
# owner account, so Deezer is the supported keyless source for catalog imports.
echo "==> Defaulting metadata provider to Deezer (no-op until DB is seeded)..."
sudo -u www-data php "$APP_DIR/deploy/set-deezer.php" || true

echo "==> Generating default favicons (assets/favicons is not shipped)..."
if [[ ! -d "$APP_DIR/assets/favicons" ]]; then
  mkdir -p "$APP_DIR/assets/favicons"
  php -r '
    $dir = $argv[1];
    foreach ([72,96,128,144,152,192,384,512] as $s) {
      $im = imagecreatetruecolor($s, $s);
      $bg = imagecolorallocate($im, 30, 30, 46);
      imagefill($im, 0, 0, $bg);
      $fg = imagecolorallocate($im, 90, 120, 250);
      $m = (int)($s * 0.2);
      imagerectangle($im, $m, $m, $s - $m, $s - $m, $fg);
      imagepng($im, "$dir/icon-{$s}x{$s}.png");
      imagedestroy($im);
    }
  ' "$APP_DIR/assets/favicons"
fi

# --- nginx ------------------------------------------------------------------
echo "==> Installing nginx vhost..."
cp "$DEPLOY_DIR/nginx-bemusic.conf" /etc/nginx/sites-available/bemusic
ln -sf /etc/nginx/sites-available/bemusic /etc/nginx/sites-enabled/bemusic
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --- queue worker + scheduler ------------------------------------------------
echo "==> Installing queue worker (systemd)..."
cp "$DEPLOY_DIR/bemusic-queue.service" /etc/systemd/system/bemusic-queue.service
systemctl daemon-reload
systemctl enable --now bemusic-queue.service >/dev/null

echo "==> Installing scheduler cron..."
printf '%s\n' '* * * * * www-data cd /var/www/bemusic && /usr/bin/php artisan schedule:run >> /dev/null 2>&1' \
  > /etc/cron.d/bemusic
chmod 644 /etc/cron.d/bemusic

echo "==> Installing nightly backups + health watchdog..."
install -m 0755 "$DEPLOY_DIR/backup.sh" "$APP_DIR/deploy/backup.sh"
install -m 0755 "$DEPLOY_DIR/healthcheck.sh" "$APP_DIR/deploy/healthcheck.sh"
printf '%s\n' \
  '0 4 * * * root /var/www/bemusic/deploy/backup.sh' \
  '*/2 * * * * root /var/www/bemusic/deploy/healthcheck.sh' \
  > /etc/cron.d/bemusic-backup
chmod 644 /etc/cron.d/bemusic-backup
# sanity run of the health check (no restarts unless 5 consecutive failures)
/var/www/bemusic/deploy/healthcheck.sh || true

# --- done -------------------------------------------------------------------
chown -R www-data:www-data "$APP_DIR"
echo
echo "=============================================================="
echo " BeMusic provisioning complete."
echo "=============================================================="
echo
echo " Site URL : $APP_URL"
echo " DB name  : bemusic   user: bemusic"
echo
echo " NEXT STEPS"
echo "   1) Open $APP_URL/install in a browser"
echo "   2) The web installer will ask for DB credentials (prefilled):"
echo "        host: 127.0.0.1   db: bemusic   user: bemusic   pass: (shown below)"
echo "      Password: $DB_PASS"
echo "   3) Create your admin email + password. The installer migrates, seeds,"
echo "      and finishes the deployment automatically."
echo "      The metadata provider is set to Deezer (Spotify is not supported"
echo "      without a premium owner account). Re-apply anytime with:"
echo "        sudo -u www-data php $APP_DIR/deploy/set-deezer.php"
echo "   4) Import your local content into the Meilisearch index:"
echo "        sudo -u www-data php $APP_DIR/artisan search:import-records-into-scout meilisearch"
echo "      (from then on, new/updated records sync automatically via Scout)"
echo
echo " OPTIONAL (recommended)"
echo "   - HTTPS:  sudo apt-get install -y certbot python3-certbot-nginx"
echo "             sudo certbot --nginx -d your-domain.com"
echo "   - Point a DNS A record to this server's public IP."
echo
echo " FREE-TIER REMINDER"
echo "   Azure's free VM allowance is 750 hours/month. Deallocate when idle:"
echo "     az vm deallocate -g <rg> -n <vm>     (start with: az vm start ...)"
echo "   The queue worker is now running as a service:"
echo "     systemctl status bemusic-queue"
echo "=============================================================="