import { Router } from "express";
import { db, investmentsTable, plansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { CreateInvestmentBody } from "@workspace/api-zod";
import { sendEmail, emailInvestmentPurchased } from "../lib/email";

const router = Router();

function formatInvestment(inv: typeof investmentsTable.$inferSelect, plan?: typeof plansTable.$inferSelect | null) {
  return {
    ...inv,
    amount: Number(inv.amount),
    profit: Number(inv.profit),
    plan: plan ? {
      ...plan,
      minAmount: Number(plan.minAmount),
      maxAmount: Number(plan.maxAmount),
      roiPercent: Number(plan.roiPercent),
      totalReturn: Number(plan.minAmount) * (Number(plan.roiPercent) / 100) * (plan.durationDays / 365),
    } : undefined,
  };
}

router.get("/investments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const invs = await db.select().from(investmentsTable).where(eq(investmentsTable.userId, req.userId!));
    const planIds = [...new Set(invs.map(i => i.planId))];
    const plans = planIds.length > 0 ? await db.select().from(plansTable).where(eq(plansTable.id, planIds[0])) : [];
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
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (Number(user.balance) < amount) return res.status(400).json({ error: "Insufficient balance" });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);
    const [inv] = await db.insert(investmentsTable).values({
      userId: req.userId!,
      planId,
      amount: String(amount),
      endDate,
      startDate: new Date(),
    }).returning();
    await db.update(usersTable).set({ balance: String(Number(user.balance) - amount), updatedAt: new Date() }).where(eq(usersTable.id, req.userId!));
    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "investment",
      amount: String(amount),
      status: "completed",
      description: `Investment in ${plan.name}`,
    });
    sendEmail(
      user.email,
      `Investment Activated — ${plan.name}`,
      emailInvestmentPurchased(user.firstName, plan.name, amount, Number(plan.roiPercent), endDate)
    ).catch(() => {});
    return res.status(201).json(formatInvestment(inv, plan));
  } catch (e) {
    return res.status(500).json({ error: "Failed to create investment" });
  }
});

router.get("/investments/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
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
