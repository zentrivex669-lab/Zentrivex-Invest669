#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Zentrivex Build Script
# Run from the project root: bash deploy/build.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║     Zentrivex Production Build       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Check pnpm ────────────────────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  echo "❌  pnpm not found. Install it: npm install -g pnpm"
  exit 1
fi

# ── Install all workspace dependencies ───────────────────────────────────────
echo "▶  Installing dependencies..."
pnpm install --frozen-lockfile
echo "✓  Dependencies installed"
echo ""

# ── Build frontend (VPS config — no Replit plugins) ──────────────────────────
echo "▶  Building frontend..."
pnpm --filter @workspace/zentrivex exec vite build \
  --config vite.config.vps.ts \
  --mode production
echo "✓  Frontend built → artifacts/zentrivex/dist/public/"
echo ""

# ── Build API server ──────────────────────────────────────────────────────────
echo "▶  Building API server..."
pnpm --filter @workspace/api-server run build
echo "✓  API server built → artifacts/api-server/dist/index.mjs"
echo ""

# ── Summary ───────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════╗"
echo "║       Build Complete ✅              ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "  Frontend : artifacts/zentrivex/dist/public/"
echo "  API      : artifacts/api-server/dist/index.mjs"
echo ""
echo "Next steps:"
echo "  1. Ensure .env is configured (copy from deploy/.env.example)"
echo "  2. Run database setup: source .env && pnpm --filter @workspace/db run push"
echo "  3. Seed the database:  source .env && node deploy/seed-db.mjs"
echo "  4. Start the server:   pm2 start deploy/ecosystem.config.cjs"
echo ""
