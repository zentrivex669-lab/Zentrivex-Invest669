# Zentrivex — Vercel Deployment Guide

## Overview

Zentrivex is a full-stack crypto investment platform. The production build consists of:
- **Frontend** — React + Vite SPA built to `.vercel-output/`
- **API** — Express app compiled to `artifacts/api-server/dist/vercel-app.mjs`, served as a Vercel Serverless Function via `api/server.mjs`
- **Cron** — Vercel Cron triggers `/api/cron/profit` daily to distribute daily investment profits

---

## Required Environment Variables

Set all of these in your Vercel project settings under **Settings → Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (e.g. Neon, Supabase, Railway) |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens — use a long random string |
| `ADMIN_SEED_PASSWORD` | ✅ first deploy | Password used only to create the initial admin account; never commit it |
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
3. Set the Vercel **Root Directory** to `./` (the repository root), then Vercel will use `vercel.json`
4. Choose **Other** as the Framework Preset if Vercel asks
5. Set the Output Directory to `.vercel-output` if Vercel displays an output-directory field
6. Add all environment variables listed above
7. Click **Deploy**

### Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Database Setup

Database setup is automated by the Vercel build. When `DATABASE_URL` is present, every deployment:

1. Pushes the Drizzle schema with `pnpm --filter @workspace/db run push`
2. Runs the idempotent `deploy/seed-db.mjs` seeder
3. Builds the API and frontend

The seeder creates the initial admin account, investment plans, and payment settings only when they do not already exist. It does not overwrite existing records. Set `ADMIN_SEED_PASSWORD` for the first deployment; the value is never printed or stored in the repository.

Zentrivex uses PostgreSQL with Drizzle ORM. Before your first deploy:

```bash
# Optional: initialize the database manually outside Vercel
DATABASE_URL=your_production_url pnpm --filter @workspace/db run push

# Optional: seed default data manually outside Vercel
DATABASE_URL=your_production_url node deploy/seed-db.mjs
```

Recommended Postgres providers: [Neon](https://neon.tech) (serverless, free tier), [Supabase](https://supabase.com), [Railway](https://railway.app).

---

## Build Details

| Step | Command |
|---|---|
| Install | `pnpm install` |
| Schema setup | `pnpm --filter @workspace/db run push` |
| Database seed | `node deploy/seed-db.mjs` |
| Build API | `pnpm --filter @workspace/api-server run build` |
| Build frontend | `BASE_PATH=/ pnpm --filter @workspace/zentrivex run build:vps` |
| Output dir | `.vercel-output` |
| API function | `api/server.mjs` → `artifacts/api-server/dist/vercel-app.mjs` |

---

## Cron Configuration

Vercel Cron is configured in `vercel.json` to call `/api/cron/profit` daily at midnight UTC:

```json
"crons": [{ "path": "/api/cron/profit", "schedule": "0 0 * * *" }]
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

# Full production build test (requires DATABASE_URL)
pnpm run build:vercel
```
