---
name: Drizzle deployment sync
description: Safe handling of legacy PostgreSQL constraints when Drizzle schema sync runs in CI or Vercel builds
---

When a PostgreSQL database already contains an unnamed or legacy-named unique constraint, give the Drizzle declaration the existing constraint name before automating `drizzle-kit push`. Do not use `--force` as a blanket CI workaround because Drizzle may truncate populated tables when it cannot prove a data-loss operation is safe.

**Why:** Drizzle's non-interactive push cannot answer its truncate confirmation prompt, and force mode can approve destructive table changes. Matching the existing constraint name lets the sync complete without data loss.

**How to apply:** Before adding schema sync to a deployment build, inspect legacy constraints and test the exact push command with a populated development database. Keep the build failing explicitly when real duplicate data prevents a safe constraint.