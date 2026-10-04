import { Router } from "express";
import { db, investmentsTable, plansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { CreateInvestmentBody } from "@workspace/api-zod";
import { sendEmail, emailInvestmentPurchased } from "../lib/email";

const router = Router();
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function formatInvestment(inv: typeof investmentsTable.$inferSelect, plan?: typeof plansTable.$inferSelect | null) {
  const amount = Number(inv.amount);
  const durationDays = Math.max(1, Math.round((inv.endDate.getTime() - inv.startDate.getTime()) / MS_PER_DAY));
  const roiPercent = Number(inv.roiPercent ?? plan?.roiPercent ?? 0);
  const totalReturn = Number((amount * roiPercent / 100).toFixed(8));

  return {
    ...inv,
    amount,
    profit: Number(inv.profit),
    plan: plan ? {
      ...plan,
      minAmount: Number(plan.minAmount),
      maxAmount: Number(plan.maxAmount),
      roiPercent,
      durationDays,
      totalReturn,
      dailyProfit: Number((totalReturn / durationDays).toFixed(8)),
    } : undefined,
  };
}

router.get("/investments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const invs = await db.select().from(investmentsTable).where(eq(investmentsTable.userId, req.userId!));
    const planIds = [...new Set(invs.map(i => i.planId))];
    const plans = planIds.length > 0 ? await db.select().from(plansTable).where(inArray(plansTable.id, planIds)) : [];
    const planMap = Object.fromEntries(plans.map(p => [p.id, p]));
    return res.json(invs.map(i => formatInvestment(i, planMap[i.planId])));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch investments" });
  }
});

router.post("/investments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateInvestmentBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { planId, amount } = parsed.data;
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId));
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    if (!plan.isActive) return res.status(400).json({ error: "Plan is not active" });
    if (amount < Number(plan.minAmount) || amount > Number(plan.maxAmount)) {
      return res.status(400).json({ error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` });
    }
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: "Amount must be positive" });

    const normalizedAmount = Number(amount.toFixed(8));
    if (normalizedAmount < Number(plan.minAmount) || normalizedAmount > Number(plan.maxAmount)) {
      return res.status(400).json({ error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` });
    }

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, req.userId!))
        .for("update");
      if (!user) return { error: "User not found", status: 404 as const };
      if (Number(user.balance) < normalizedAmount) {
        return { error: "Insufficient balance", status: 400 as const };
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + plan.durationDays * MS_PER_DAY);
      const [inv] = await tx.insert(investmentsTable).values({
        userId: req.userId!,
        planId,
        amount: normalizedAmount.toFixed(8),
        roiPercent: String(plan.roiPercent),
        startDate,
        lastProfitAt: startDate,
        endDate,
      }).returning();

      await tx.update(usersTable).set({
        balance: (Number(user.balance) - normalizedAmount).toFixed(8),
        updatedAt: startDate,
      }).where(eq(usersTable.id, req.userId!));

      await tx.insert(transactionsTable).values({
        userId: req.userId!,
        type: "investment",
        amount: normalizedAmount.toFixed(8),
        status: "completed",
        description: `Investment in ${plan.name}`,
      });

      return { inv, user };
    });

    if ("error" in result) return res.status(result.status ?? 400).json({ error: result.error });

    const { inv, user } = result;
    sendEmail(
      user.email,
      `Investment Activated — ${plan.name}`,
      emailInvestmentPurchased(user.firstName, plan.name, normalizedAmount, Number(plan.roiPercent), inv.endDate)
    ).catch(() => {});
    return res.status(201).json(formatInvestment(inv, plan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to create investment" });
  }
});

router.get("/investments/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const [inv] = await db.select().from(investmentsTable).where(and(eq(investmentsTable.id, id), eq(investmentsTable.userId, req.userId!)));
    if (!inv) return res.status(404).json({ error: "Investment not found" });
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, inv.planId));
    return res.json(formatInvestment(inv, plan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch investment" });
  }
});

router.get("/investments/:id/profit-history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const [inv] = await db.select().from(investmentsTable).where(and(eq(investmentsTable.id, id), eq(investmentsTable.userId, req.userId!)));
    if (!inv) return res.status(404).json({ error: "Investment not found" });
    const rows = await db
      .select()
      .from(transactionsTable)
      .where(and(eq(transactionsTable.investmentId, id), eq(transactionsTable.type, "profit")))
      .orderBy(transactionsTable.createdAt);

    let cumulative = 0;
    const history = rows.map(r => {
      cumulative = parseFloat((cumulative + Number(r.amount)).toFixed(8));
      return {
        date: r.createdAt,
        amount: Number(r.amount),
        cumulativeProfit: cumulative,
        description: r.description,
      };
    });
    return res.json(history);
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch profit history" });
  }
});

export default router;
