import { Router } from "express";
import { db, depositsTable, usersTable, transactionsTable, settingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { CreateDepositBody, RejectDepositBody } from "@workspace/api-zod";
import {
  sendEmail,
  emailDepositSubmitted,
  emailDepositApproved,
  emailDepositRejected,
  emailReferralBonus,
} from "../lib/email";
import { DEFAULT_REFERRAL_SETTINGS } from "./settings";

async function getReferralSettings() {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "referral_settings"));
  if (!row) return DEFAULT_REFERRAL_SETTINGS;
  try { return JSON.parse(row.value); } catch { return DEFAULT_REFERRAL_SETTINGS; }
}

async function creditReferralBonusIfEligible(depositUserId: number, depositAmount: number) {
  const [depositUser] = await db.select().from(usersTable).where(eq(usersTable.id, depositUserId));
  if (!depositUser || !depositUser.referredBy) return;

  const settings = await getReferralSettings();
  if (!settings.enabled || settings.bonusPercent <= 0) return;

  const priorApprovedDeposits = await db.select().from(depositsTable).where(
    and(eq(depositsTable.userId, depositUserId), eq(depositsTable.status, "approved"))
  );
  if (priorApprovedDeposits.length > 1) return;

  const [referrer] = await db.select().from(usersTable).where(eq(usersTable.id, depositUser.referredBy));
  if (!referrer) return;

  const bonus = depositAmount * (settings.bonusPercent / 100);
  if (bonus <= 0) return;

  const newBalance = Number(referrer.balance) + bonus;
  await db.update(usersTable).set({ balance: String(newBalance), updatedAt: new Date() }).where(eq(usersTable.id, referrer.id));
  await db.insert(transactionsTable).values({
    userId: referrer.id,
    type: "referral",
    amount: String(bonus),
    status: "completed",
    description: `Referral bonus — ${depositUser.firstName} ${depositUser.lastName}'s first deposit`,
  });
  sendEmail(
    referrer.email,
    "Referral Bonus Earned 🎁 — Zentrivex",
    emailReferralBonus(referrer.firstName, `${depositUser.firstName} ${depositUser.lastName}`, bonus, newBalance)
  ).catch(() => {});
}

const router = Router();

function formatDeposit(d: typeof depositsTable.$inferSelect, user?: typeof usersTable.$inferSelect | null) {
  return {
    ...d,
    amount: Number(d.amount),
    approvedAt: d.approvedAt ? d.approvedAt.toISOString() : null,
    user: user ? { ...user, balance: Number(user.balance), password: undefined } : undefined,
  };
}

router.get("/deposits", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deps = await db.select().from(depositsTable).where(eq(depositsTable.userId, req.userId!));
    return res.json(deps.map(d => formatDeposit(d)));
  } catch {
    return res.status(500).json({ error: "Failed to fetch deposits" });
  }
});

router.post("/deposits", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateDepositBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { amount, currency, walletAddress, txHash, proofImage } = parsed.data;
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });
    const [dep] = await db.insert(depositsTable).values({
      userId: req.userId!,
      amount: String(amount),
      currency,
      walletAddress,
      txHash: txHash ?? null,
      proofImage: proofImage ?? null,
    }).returning();
    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "deposit",
      amount: String(amount),
      status: "pending",
      description: `Deposit of ${amount} ${currency} - pending approval`,
    });
    // Send email asynchronously (non-blocking)
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (user) {
      sendEmail(
        user.email,
        "Deposit Received — Zentrivex",
        emailDepositSubmitted(user.firstName, amount, currency, new Date())
      ).catch(() => {});
    }
    return res.status(201).json(formatDeposit(dep));
  } catch {
    return res.status(500).json({ error: "Failed to create deposit" });
  }
});

router.get("/admin/deposits", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const deps = await db.select().from(depositsTable);
    const userIds = [...new Set(deps.map(d => d.userId))];
    const users = userIds.length > 0 ? await db.select().from(usersTable) : [];
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    return res.json(deps.map(d => formatDeposit(d, userMap[d.userId])));
  } catch {
    return res.status(500).json({ error: "Failed to fetch deposits" });
  }
});

router.patch("/admin/deposits/:id/approve", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [dep] = await db.select().from(depositsTable).where(eq(depositsTable.id, id));
    if (!dep) return res.status(404).json({ error: "Deposit not found" });
    if (dep.status !== "pending") return res.status(400).json({ error: "Deposit is not pending" });
    const [updated] = await db.update(depositsTable).set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() }).where(eq(depositsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dep.userId));
    const newBalance = Number(user.balance) + Number(dep.amount);
    await db.update(usersTable).set({ balance: String(newBalance), updatedAt: new Date() }).where(eq(usersTable.id, dep.userId));
    await db.insert(transactionsTable).values({
      userId: dep.userId,
      type: "deposit",
      amount: dep.amount,
      status: "completed",
      description: `Deposit of ${dep.amount} ${dep.currency} approved`,
    });
    if (user) {
      sendEmail(
        user.email,
        "Deposit Approved — Funds Credited ✓",
        emailDepositApproved(user.firstName, Number(dep.amount), newBalance)
      ).catch(() => {});
    }
    creditReferralBonusIfEligible(dep.userId, Number(dep.amount)).catch(() => {});
    return res.json(formatDeposit(updated));
  } catch {
    return res.status(500).json({ error: "Failed to approve deposit" });
  }
});

router.patch("/admin/deposits/:id/reject", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = RejectDepositBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Rejection reason required" });
    const [dep] = await db.select().from(depositsTable).where(eq(depositsTable.id, id));
    if (!dep) return res.status(404).json({ error: "Deposit not found" });
    if (dep.status !== "pending") return res.status(400).json({ error: "Deposit is not pending" });
    const [updated] = await db.update(depositsTable).set({ status: "rejected", rejectionReason: parsed.data.reason, updatedAt: new Date() }).where(eq(depositsTable.id, id)).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, dep.userId));
    if (user) {
      sendEmail(
        user.email,
        "Deposit Rejected — Action Required",
        emailDepositRejected(user.firstName, Number(dep.amount), parsed.data.reason)
      ).catch(() => {});
    }
    return res.json(formatDeposit(updated));
  } catch {
    return res.status(500).json({ error: "Failed to reject deposit" });
  }
});

export default router;
