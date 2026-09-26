import { Router } from "express";
import { processDailyProfits } from "../jobs/profit-distribution";
import { logger } from "../lib/logger";

const router = Router();

router.post("/cron/profit", async (req, res) => {
  const secret = process.env["CRON_SECRET"];
  const provided =
    req.headers["x-cron-secret"] ||
    req.headers["authorization"]?.toString().replace("Bearer ", "");

  if (!secret || provided !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await processDailyProfits();
    logger.info("Profit distribution triggered via cron endpoint");
    return res.json({ ok: true, message: "Profit distribution completed" });
  } catch (e) {
    logger.error({ err: e }, "Profit distribution cron failed");
    return res.status(500).json({ error: "Cron job failed" });
  }
});

export default router;
