---
name: Vercel root directory
description: Vercel must build this monorepo from the repository root so the root vercel.json controls both the SPA and API function.
---

The Vercel project Root Directory must be `./` (the repository root), not `artifacts/api-server` or `artifacts/zentrivex`.

**Why:** When Vercel is rooted at the API package, it auto-detects Express and can serve the compiled API bundle as the homepage while ignoring the root deployment configuration.

**How to apply:** In Vercel Project Settings, set Root Directory to the repository root and Framework Preset to Other, then redeploy from the latest `main` commit.