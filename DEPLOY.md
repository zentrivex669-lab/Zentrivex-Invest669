# Zentrivex — VPS Deployment Guide
### Ubuntu 22.04 / 24.04 · Nginx · PM2 · PostgreSQL · Namecheap Domain

---

## Architecture Overview

```
Internet
    │
    ▼
[Nginx :80 / :443]  ← serves static frontend files
    │
    ├── /api/*  → proxy → [PM2: Express API :3000]
    │                              │
    │                              ▼
    │                      [PostgreSQL :5432]
    │
    └── /* → /opt/zentrivex/artifacts/zentrivex/dist/public/index.html
                        (React SPA — all routes handled client-side)
```

---

## Section 1 — Prerequisites

- Namecheap VPS with Ubuntu 22.04 or 24.04 LTS
- SSH access as root or a sudo user
- A domain name pointed at your VPS (see Section 6)
- Minimum specs: **2 vCPU, 2 GB RAM, 20 GB SSD**

---

## Section 2 — Server Setup (Run Once)

SSH into your VPS and run the automated setup script:

```bash
# Upload the project first (from your local machine)
scp -r /path/to/zentrivex-project root@YOUR_VPS_IP:/opt/zentrivex

# SSH into the VPS
ssh root@YOUR_VPS_IP

# Run the setup script
cd /opt/zentrivex
bash deploy/setup-ubuntu.sh
```

**The setup script installs:**
- Node.js 22 LTS
- pnpm 10
- PM2 (process manager)
- PostgreSQL 16
- Nginx
- Certbot (for HTTPS)
- UFW firewall (SSH + HTTP + HTTPS allowed)

> ⚠️ **SAVE** the database credentials printed at the end. You will need them for `.env`.

---

## Section 3 — Environment Variables

```bash
cd /opt/zentrivex
cp deploy/.env.example .env
nano .env
```

Fill in every value:

```env
DATABASE_URL=postgresql://zentrivex_user:YOUR_DB_PASSWORD@localhost:5432/zentrivex_db
PORT=3000
NODE_ENV=production
JWT_SECRET=paste-output-of--openssl-rand-hex-64--here
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-16-char-gmail-app-password
```

Generate a strong JWT secret:
```bash
openssl rand -hex 64
```

---

## Section 4 — Build the Application

```bash
cd /opt/zentrivex
bash deploy/build.sh
```

This runs in order:
1. `pnpm install --frozen-lockfile`
2. `vite build --config vite.config.vps.ts` → `artifacts/zentrivex/dist/public/`
3. `esbuild` bundle → `artifacts/api-server/dist/index.mjs`

---

## Section 5 — Database Setup

### 5a. Push the schema (create all tables)

```bash
cd /opt/zentrivex
source .env
pnpm --filter @workspace/db run push
```

This uses `drizzle-kit push` to create all tables:
`users`, `plans`, `investments`, `deposits`, `withdrawals`, `kyc`, `transactions`, `settings`

### 5b. Seed the database (admin user + plans)

```bash
cd /opt/zentrivex
source .env
node deploy/seed-db.mjs
```

**Creates:**
| Item | Value |
|---|---|
| Admin email | `support@zentrivex.com` |
| Admin password | Set through `ADMIN_SEED_PASSWORD` in `.env` |
| Starter Fund | 12.5% ROI · 30 days · $500–$4,999 |
| Growth Fund | 22.0% ROI · 60 days · $5,000–$24,999 |
| Premium Fund | 32.5% ROI · 90 days · $25,000–$99,999 |
| Elite Fund | 42.5% ROI · 180 days · $100,000+ |

> ⚠️ **Change the admin password** after your first login via the admin portal.

---

## Section 6 — Nginx Configuration

### 6a. Install the site config

```bash
# Copy the Nginx config
sudo cp /opt/zentrivex/deploy/nginx.conf /etc/nginx/sites-available/zentrivex

# Edit it — replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/zentrivex

# Enable it
sudo ln -sf /etc/nginx/sites-available/zentrivex /etc/nginx/sites-enabled/zentrivex

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6b. Verify Nginx is serving the frontend

```bash
curl -I http://YOUR_VPS_IP/
# Should return HTTP/1.1 200 OK
```

---

## Section 7 — Start the API Server with PM2

```bash
cd /opt/zentrivex

# Start the API
pm2 start deploy/ecosystem.config.cjs

# Save process list (auto-restart on server reboot)
pm2 save

# Enable PM2 startup on boot
pm2 startup
# Run the command it prints (e.g.: sudo env PATH=$PATH:... pm2 startup ...)

# Verify it's running
pm2 status
pm2 logs zentrivex-api --lines 50
```

**Test the API is responding:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Section 8 — SSL / HTTPS with Let's Encrypt (Recommended)

```bash
# Obtain free SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot auto-configures Nginx for HTTPS
# It also sets up auto-renewal via a systemd timer

# Verify auto-renewal works
sudo certbot renew --dry-run
```

After Certbot finishes, the `listen 443 ssl` block in your Nginx config is
automatically activated. Your site will serve over HTTPS.

---

## Section 9 — Namecheap Domain Connection

### 9a. Get your VPS IP address

```bash
curl -4 ifconfig.me
```

### 9b. Set DNS records in Namecheap

1. Log into **Namecheap** → **Domain List** → click **Manage** on your domain
2. Go to **Advanced DNS** tab
3. Delete all existing `A` records
4. Add these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `@` | `YOUR_VPS_IP` | Automatic |
| A Record | `www` | `YOUR_VPS_IP` | Automatic |

5. Click **Save Changes**

DNS propagation takes **5–30 minutes** (up to 24h in some regions).

### 9c. Verify DNS propagation

```bash
# On your local machine
nslookup yourdomain.com
dig yourdomain.com A
# Should return your VPS IP
```

### 9d. Test your domain

```bash
curl -I http://yourdomain.com/
curl http://yourdomain.com/api/health
```

---

## Section 10 — Port Configuration Reference

| Service | Port | Access |
|---------|------|--------|
| Nginx HTTP | 80 | Public (redirects to 443 after SSL) |
| Nginx HTTPS | 443 | Public |
| Express API | 3000 | Internal only (proxied by Nginx) |
| PostgreSQL | 5432 | Internal only |

**Never expose port 3000 or 5432 directly to the internet.**
The UFW firewall blocks them by default.

---

## Section 11 — Startup Commands Reference

| Action | Command |
|--------|---------|
| Build everything | `bash deploy/build.sh` |
| Push DB schema | `source .env && pnpm --filter @workspace/db run push` |
| Seed database | `source .env && node deploy/seed-db.mjs` |
| Start API (PM2) | `pm2 start deploy/ecosystem.config.cjs` |
| Stop API | `pm2 stop zentrivex-api` |
| Restart API | `pm2 restart zentrivex-api` |
| View logs | `pm2 logs zentrivex-api` |
| Reload Nginx | `sudo systemctl reload nginx` |
| Nginx status | `sudo systemctl status nginx` |
| DB connect | `psql $DATABASE_URL` |

---

## Section 12 — Deploying Updates

After making code changes:

```bash
cd /opt/zentrivex

# 1. Pull latest code (if using Git)
git pull origin main

# 2. Rebuild
bash deploy/build.sh

# 3. Restart API
pm2 restart zentrivex-api

# 4. If schema changed, push migrations
source .env && pnpm --filter @workspace/db run push

# Nginx doesn't need reloading — it reads static files directly
```

---

## Section 13 — ZIP Export / File Transfer

### Option A: Transfer via SCP from Replit

```bash
# On your local machine — download from Replit
# 1. Export project from Replit (⋮ → Download as ZIP)
# 2. Extract the ZIP
# 3. Upload to VPS:
scp -r zentrivex/ root@YOUR_VPS_IP:/opt/zentrivex
```

### Option B: Git

```bash
# On VPS
cd /opt
git clone https://github.com/yourusername/zentrivex.git zentrivex
```

### Files NOT needed on VPS (safe to exclude)

```
.replit
replit.nix
artifacts/mockup-sandbox/    (design tool, not needed in production)
**/.local/                   (Replit agent files)
**/node_modules/             (re-installed by pnpm install)
artifacts/zentrivex/dist/    (re-built by build.sh)
artifacts/api-server/dist/   (re-built by build.sh)
**/*.map                     (source maps, optional)
```

---

## Section 14 — Troubleshooting

### API returns 502 Bad Gateway
```bash
pm2 status                    # Is the API running?
pm2 logs zentrivex-api        # Check for startup errors
source .env && echo $DATABASE_URL  # Is DATABASE_URL set?
```

### Frontend shows blank page
```bash
ls /opt/zentrivex/artifacts/zentrivex/dist/public/
# Should contain: index.html, assets/
# If empty: re-run bash deploy/build.sh
```

### Database connection refused
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"  # List databases
```

### Nginx 404 for all routes
```bash
sudo nginx -t                  # Test config syntax
cat /etc/nginx/sites-enabled/zentrivex  # Check root path
```

### Port 3000 already in use
```bash
lsof -i :3000
pm2 delete all && pm2 start deploy/ecosystem.config.cjs
```

### Check firewall rules
```bash
sudo ufw status verbose
```

---

## Admin Portal

After deployment, access the admin portal at:

```
https://yourdomain.com/admin-portal
```

| Field | Value |
|-------|-------|
| Email | `support@zentrivex.com` |
| Password | The value configured in `ADMIN_SEED_PASSWORD` |

> ⚠️ **Change this password immediately** after your first login.

---

## Email Setup

The platform sends emails via Gmail SMTP. To enable:

1. Enable **2-Step Verification** on your Gmail account
2. Go to **myaccount.google.com → Security → App Passwords**
3. Generate a password named "Zentrivex"
4. Add the 16-character password to `.env` as `EMAIL_PASS`
5. Restart: `pm2 restart zentrivex-api`

Email notifications are sent for:
- New user registration (welcome)
- Deposit submitted / approved / rejected
- Withdrawal submitted / approved / rejected
- Investment activated
- Investment matured (profit credited)
- KYC submitted / approved / rejected

---

*Zentrivex VPS Deployment Guide — Generated for Namecheap Ubuntu VPS*
