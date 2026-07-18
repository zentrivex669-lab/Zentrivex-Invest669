// Vercel Serverless Function — wraps the Express app
// Built by: pnpm --filter @workspace/api-server run build
// The pre-compiled bundle is self-contained (all workspace deps bundled by esbuild)
import app from "../artifacts/api-server/dist/vercel-app.mjs";

export default app;
