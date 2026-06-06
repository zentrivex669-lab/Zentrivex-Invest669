#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Zentrivex Ubuntu VPS Setup Script
# Tested on: Ubuntu 22.04 LTS / 24.04 LTS
#
# Usage (as root or sudo user):
#   bash deploy/setup-ubuntu.sh
#
# What this does:
#   1. Updates system packages
#   2. Installs Node.js 22 LTS via NodeSource
#   3. Installs pnpm, PM2
#   4. Installs PostgreSQL 16
#   5. Creates the zentrivex database and user
#   6. Installs and configures Nginx
#   7. Creates /opt/zentrivex directory
#   8. Creates log directory
#
# After running this script, follow DEPLOY.md for the remaining steps.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Config ─────────────────────────────────────────────────────────────────
DB_NAME="zentrivex_db"
DB_USER="zentrivex_user"
DB_PASS="${ZENTRIVEX_DB_PASS:-$(openssl rand -hex 16)}"   # auto-generate if not set
APP_DIR="/opt/zentrivex"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Zentrivex VPS Setup — Ubuntu       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. System update ───────────────────────────────────────────────────────
echo "▶  Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl gnupg2 ca-certificates lsb-release software-properties-common unzip git ufw fail2ban
echo "✓  System updated"

# ── 2. Node.js 22 via NodeSource ───────────────────────────────────────────
echo "▶  Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
echo "✓  Node.js $(node --version) installed"

# ── 3. pnpm ────────────────────────────────────────────────────────────────
echo "▶  Installing pnpm..."
npm install -g pnpm@10
echo "✓  pnpm $(pnpm --version) installed"

# ── 4. PM2 ────────────────────────────────────────────────────────────────
echo "▶  Installing PM2..."
npm install -g pm2
echo "✓  PM2 $(pm2 --version) installed"

# ── 5. PostgreSQL 16 ───────────────────────────────────────────────────────
echo "▶  Installing PostgreSQL 16..."
apt-get install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
echo "✓  PostgreSQL $(psql --version | awk '{print $3}') installed"

# ── 6. Create DB + User ────────────────────────────────────────────────────
echo "▶  Setting up database..."
sudo -u postgres psql <<-EOSQL
  -- Create user
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASS}';
    END IF;
  END
  \$\$;

  -- Create database
  SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
  \gexec

  -- Grant privileges
  GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
  ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOSQL
echo "✓  Database '${DB_NAME}' and user '${DB_USER}' created"

# ── 7. Nginx ───────────────────────────────────────────────────────────────
echo "▶  Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx
echo "✓  Nginx $(nginx -v 2>&1 | awk -F/ '{print $2}') installed"

# ── 8. Certbot (for HTTPS) ─────────────────────────────────────────────────
echo "▶  Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx
echo "✓  Certbot installed"

# ── 9. App directory ───────────────────────────────────────────────────────
echo "▶  Creating app directory..."
mkdir -p "$APP_DIR"
mkdir -p /var/log/zentrivex
echo "✓  Directories created: $APP_DIR  /var/log/zentrivex"

# ── 10. Firewall ───────────────────────────────────────────────────────────
echo "▶  Configuring UFW firewall..."
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable
echo "✓  Firewall configured (SSH + HTTP + HTTPS allowed)"

# ── Done ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              Setup Complete ✅                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  SAVE THESE CREDENTIALS — shown only once       │"
echo "  │                                                  │"
echo "  │  Database name   : ${DB_NAME}            │"
echo "  │  Database user   : ${DB_USER}          │"
echo "  │  Database pass   : ${DB_PASS}  │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "  Your DATABASE_URL:"
echo "  postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
echo ""
echo "  Next: Follow DEPLOY.md → Section 3 (Deploy the Application)"
echo ""
