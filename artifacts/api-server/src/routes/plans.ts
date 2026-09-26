import { Router } from "express";
import { db, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { CreatePlanBody, UpdatePlanBody } from "@workspace/api-zod";

const router = Router();

function formatPlan(p: typeof plansTable.$inferSelect) {
  const roi = Number(p.roiPercent);
  const days = p.durationDays;
  const totalReturn = Number(p.minAmount) * (roi / 100) * (days / 365);
  return {
    ...p,
    minAmount: Number(p.minAmount),
    maxAmount: Number(p.maxAmount),
    roiPercent: roi,
    totalReturn,
  };
}

router.get("/plans", async (req, res) => {
  try {
    const plans = await db.select().from(plansTable).where(eq(plansTable.isActive, true));
    return res.json(plans.map(formatPlan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch plans" });
  }
});

router.get("/plans/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, id));
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    return res.json(formatPlan(plan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch plan" });
  }
});

router.post("/plans", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = CreatePlanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [plan] = await db.insert(plansTable).values({
      ...parsed.data,
      minAmount: String(parsed.data.minAmount),
      maxAmount: String(parsed.data.maxAmount),
      roiPercent: String(parsed.data.roiPercent),
    }).returning();
    return res.status(201).json(formatPlan(plan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to create plan" });
  }
});

router.patch("/plans/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdatePlanBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.minAmount !== undefined) updates.minAmount = String(parsed.data.minAmount);
    if (parsed.data.maxAmount !== undefined) updates.maxAmount = String(parsed.data.maxAmount);
    if (parsed.data.roiPercent !== undefined) updates.roiPercent = String(parsed.data.roiPercent);
    const [plan] = await db.update(plansTable).set(updates).where(eq(plansTable.id, id)).returning();
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    return res.json(formatPlan(plan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to update plan" });
  }
});

router.delete("/plans/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(plansTable).set({ isActive: false }).where(eq(plansTable.id, id));
    return res.status(204).send();
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete plan" });
  }
});

export default router;
