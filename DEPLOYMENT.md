# Zentrivex — Vercel Deployment Guide

## Overview

Zentrivex is a full-stack crypto investment platform. The production build consists of:
- **Frontend** — React + Vite SPA built to `artifacts/zentrivex/dist/public/`
- **API** — Express app compiled to `artifacts/api-server/dist/vercel-app.mjs`, served as a Vercel Serverless Function via `api/server.mjs`
- **Cron** — Vercel Cron triggers `/api/cron/profit` hourly to distribute daily investment profits

---

## Required Environment Variables

Set all of these in your Vercel project settings under **Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (e.g. Neon, Supabase, Railway) |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens — use a long random string |
| `SESSION_SECRET` | ✅ | Express session secret — use a long random string |
| `APP_URL` | ✅ | Your production URL, e.g. `https://zentrivex.vercel.app` |
| `CRON_SECRET` | ✅ | Secret to authenticate the `/api/cron/profit` endpoint |
| `EMAIL_USER` | ⚠️ | Gmail address for sending emails (e.g. `you@gmail.com`) |
| `EMAIL_PASS` | ⚠️ | Gmail App Password (not your account password) |
| `NODE_ENV` | — | Set automatically by Vercel to `production` |

> **Tip:** Generate `JWT_SECRET` and `SESSION_SECRET` with `openssl rand -base64 48`.

---

## Deploy to Vercel

### One-click (GitHub)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Vercel auto-detects `vercel.json` — no framework preset needed
4. Add all environment variables listed above
5. Click **Deploy**

### Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Database Setup

Zentrivex uses PostgreSQL with Drizzle ORM. Before your first deploy:

```bash
# Push schema to your production database
DATABASE_URL=your_production_url pnpm --filter @workspace/db run push

# (Optional) Seed default data
DATABASE_URL=your_production_url node deploy/seed-db.mjs
```

Recommended Postgres providers: [Neon](https://neon.tech) (serverless, free tier), [Supabase](https://supabase.com), [Railway](https://railway.app).

---

## Build Details

| Step | Command |
|---|---|
| Install | `pnpm install --frozen-lockfile` |
| Build API | `pnpm --filter @workspace/api-server run build` |
| Build frontend | `BASE_PATH=/ pnpm --filter @workspace/zentrivex run build:vps` |
| Output dir | `artifacts/zentrivex/dist/public` |
| API function | `api/server.mjs` → `artifacts/api-server/dist/vercel-app.mjs` |

---

## Cron Configuration

Vercel Cron is configured in `vercel.json` to call `/api/cron/profit` every hour:

```json
"crons": [{ "path": "/api/cron/profit", "schedule": "0 * * * *" }]
```

The endpoint requires an `Authorization: Bearer <CRON_SECRET>` header. Vercel automatically sets this via the `CRON_SECRET` environment variable.

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start API server (port from workflow)
pnpm --filter @workspace/api-server run dev

# Start frontend dev server (port from workflow)
pnpm --filter @workspace/zentrivex run dev

# Full production build test
pnpm run build:vercel
```
