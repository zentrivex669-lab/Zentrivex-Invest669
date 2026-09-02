# Zentrivex

A full-stack crypto investment platform with user dashboards, admin controls, investment plans, KYC, referrals, and automated daily profit distribution.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/zentrivex run dev` — run the frontend dev server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build:vercel` — production build with database schema sync, idempotent seed, API, and frontend (requires `DATABASE_URL`)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (compiled via esbuild for Vercel serverless)
- DB: PostgreSQL + Drizzle ORM
- Frontend: React 19 + Vite 7 + Tailwind CSS v4
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API, Rollup/Vite for frontend)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — generated Zod schemas (do not edit)
- `lib/db/src/schema/` — Drizzle DB schema definitions
- `artifacts/api-server/src/` — Express API server
- `artifacts/zentrivex/src/` — React frontend
- `artifacts/api-server/dist/vercel-app.mjs` — compiled API for Vercel (git-ignored, rebuilt on deploy)
- `api/server.mjs` — Vercel serverless function entry point

## Architecture decisions

- OpenAPI-first: all types flow from `lib/api-spec/openapi.yaml` → codegen → frontend hooks + server Zod validators
- Vercel deployment uses a second esbuild target (`vercel-app.mjs`) that bundles the Express app without the cron job; the cron runs via Vercel Cron hitting `/api/cron/profit`
- Daily profit distribution job runs via `setInterval` in the standalone server (`src/index.ts`), and via the `/api/cron/profit` endpoint on Vercel
- JWT auth (7d expiry), bcrypt password hashing, pino structured logging

## Product

- User registration/login with email verification
- KYC document submission and admin review
- Investment plans with configurable ROI and duration
- Automated daily profit distribution (interval job + Vercel Cron)
- Deposit and withdrawal management with admin approval
- Referral system with configurable bonus
- Admin dashboard: users, KYC, deposits, withdrawals, plans, settings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing the OpenAPI spec, always run `pnpm --filter @workspace/api-spec run codegen` before touching frontend code.
- Do NOT run `pnpm dev` at the workspace root — apps need `PORT` and `BASE_PATH` env vars wired by workflows.
- The `@replit/*` vite plugins are used by `artifacts/mockup-sandbox` only; they must remain in `pnpm-workspace.yaml` catalog but should NOT be added to `artifacts/zentrivex/package.json`.
- Vercel `outputDirectory` is `.vercel-output` — the `build:vps` script uses `vite.config.vps.ts` which outputs there. Vercel Root Directory must remain `./` (repository root).

## Pointers

- See `DEPLOYMENT.md` for full Vercel deployment instructions and required environment variables
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
