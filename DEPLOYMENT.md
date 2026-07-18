# Zentrivex — Vercel Deployment Guide

## Overview

Zentrivex is a full-stack investment platform with:
- **Frontend**: React + Vite (served as static files)
- **Backend**: Express API (deployed as a Vercel serverless function)
- **Database**: PostgreSQL (external provider required)

---

## Prerequisites

- A **PostgreSQL** database (recommended: [Neon](https://neon.tech) — free tier available)
- A **GitHub** account (to connect your repo to Vercel)
- A [**Vercel**](https://vercel.com) account (free tier works)

---

## Step 1 — Set Up Your Database

1. Create a free PostgreSQL database on [Neon](https://neon.tech) (or Supabase/Railway)
2. Copy the connection string — it looks like:
   ```
   postgresql://user:password@host.neon.tech/zentrivex_db?sslmode=require
   ```
3. Run the database schema (first deploy only):
   ```bash
   DATABASE_URL="your_connection_string" pnpm --filter @workspace/db run push-force
   ```

---

## Step 2 — Deploy on Vercel

### Option A — One-click from GitHub

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo
3. Vercel will auto-detect `vercel.json` — no framework override needed
4. Add the required environment variables (see below)
5. Click **Deploy**

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Required Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Random secret for JWT tokens (min 32 chars) |
| `APP_URL` | ✅ | Your deployed app URL, e.g. `https://zentrivex-invest.vercel.app` |
| `EMAIL_USER` | Optional | Gmail address for transactional emails |
| `EMAIL_PASS` | Optional | Gmail App Password ([get one here](https://myaccount.google.com/apppasswords)) |
| `CRON_SECRET` | ✅ | Random secret to protect the profit cron endpoint |
| `NODE_ENV` | ✅ | Set to `production` |

To generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Profit Distribution Cron Job

Daily profit crediting runs via `POST /api/cron/profit` protected by `CRON_SECRET`.

- **Vercel Pro**: Already configured in `vercel.json` — runs every hour automatically
- **Vercel Free / External**: Use [cron-job.org](https://cron-job.org) (free) to call:
  ```
  POST https://your-app.vercel.app/api/cron/profit
  Authorization: Bearer YOUR_CRON_SECRET
  ```
  Schedule: `0 * * * *` (every hour)

---

## Post-Deployment

### Seed Initial Data (investment plans)

```bash
DATABASE_URL="your_prod_connection_string" node deploy/seed-db.mjs
```

### Create Admin Account

Register normally via the app, then run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Local Development

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Start dev servers (in separate terminals)
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/zentrivex run dev
```

---

## Vercel Build Info

The `vercel.json` at the project root configures:
- **Build**: Compiles the Express API + Vite frontend
- **Output**: Frontend static files from `artifacts/zentrivex/dist/public`
- **API**: `api/server.mjs` — wraps the pre-compiled Express bundle
- **Rewrites**: `/api/*` → serverless function, everything else → `index.html`
