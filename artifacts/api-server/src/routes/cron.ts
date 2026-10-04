import { Router, type Request, type Response } from "express";
import { processDailyProfits } from "../jobs/profit-distribution";
import { logger } from "../lib/logger";

const router = Router();

async function runProfitDistribution(req: Request, res: Response): Promise<void> {
  const secret = process.env["CRON_SECRET"];
  const provided =
    req.headers["x-cron-secret"] ||
    req.headers["authorization"]?.toString().replace("Bearer ", "");

  if (!secret || provided !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    await processDailyProfits();
    logger.info("Profit distribution triggered via cron endpoint");
    res.json({ ok: true, message: "Profit distribution completed" });
  } catch (e) {
    logger.error({ err: e }, "Profit distribution cron failed");
    res.status(500).json({ error: "Cron job failed" });
  }
}

router.get("/cron/profit", runProfitDistribution);
router.post("/cron/profit", runProfitDistribution);

export default router;
