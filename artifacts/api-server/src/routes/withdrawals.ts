import { Router } from "express";
import { db, withdrawalsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { CreateWithdrawalBody, RejectWithdrawalBody } from "@workspace/api-zod";
import {
  sendEmail,
  emailWithdrawalSubmitted,
  emailWithdrawalApproved,
  emailWithdrawalRejected,
} from "../lib/email";

const router = Router();

function formatWithdrawal(w: typeof withdrawalsTable.$inferSelect, user?: typeof usersTable.$inferSelect | null) {
  return {
    ...w,
    amount: Number(w.amount),
    approvedAt: w.approvedAt ? w.approvedAt.toISOString() : null,
    user: user ? { ...user, balance: Number(user.balance), password: undefined } : undefined,
  };
}

router.get("/withdrawals", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const wds = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, req.userId!));
    return res.json(wds.map(w => formatWithdrawal(w)));
  } catch {
    return res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

router.post("/withdrawals", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = CreateWithdrawalBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { amount, walletAddress, network } = parsed.data;
    if (amount <= 0) return res.status(400).json({ error: "Amount must be positive" });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (Number(user.balance) < amount) return res.status(400).json({ error: "Insufficient balance" });
    await db.update(usersTable).set({ balance: String(Number(user.balance) - amount), updatedAt: new Date() }).where(eq(usersTable.id, req.userId!));
    const [wd] = await db.insert(withdrawalsTable).values({
      userId: req.userId!,
      amount: String(amount),
      walletAddress,
      network: network ?? null,
    }).returning();
    await db.insert(transactionsTable).values({
      userId: req.userId!,
      type: "withdrawal",
      amount: String(amount),
      status: "pending",
      description: `Withdrawal of $${amount} to ${walletAddress.slice(0, 10)}... pending approval`,
    });
    sendEmail(
      user.email,
      "Withdrawal Request Received — Zentrivex",
      emailWithdrawalSubmitted(user.firstName, amount, walletAddress, new Date())
    ).catch(() => {});
    return res.status(201).json(formatWithdrawal(wd));
  } catch {
    return res.status(500).json({ error: "Failed to create withdrawal" });
  }
});

router.get("/admin/withdrawals", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const wds = await db.select().from(withdrawalsTable);
    const users = await db.select().from(usersTable);
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    return res.json(wds.map(w => formatWithdrawal(w, userMap[w.userId])));
  } catch {
    return res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

router.patch("/admin/withdrawals/:id/approve", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [wd] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id));
    if (!wd) return res.status(404).json({ error: "Withdrawal not found" });
    if (wd.status !== "pending") return res.status(400).json({ error: "Withdrawal is not pending" });
    const [updated] = await db.update(withdrawalsTable).set({ status: "approved", approvedAt: new Date(), updatedAt: new Date() }).where(eq(withdrawalsTable.id, id)).returning();
    await db.insert(transactionsTable).values({
      userId: wd.userId,
      type: "withdrawal",
      amount: wd.amount,
      status: "completed",
      description: `Withdrawal of $${wd.amount} approved`,
    });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, wd.userId));
    if (user) {
      sendEmail(
        user.email,
        "Withdrawal Approved — Funds Sent ✓",
        emailWithdrawalApproved(user.firstName, Number(wd.amount), wd.walletAddress)
      ).catch(() => {});
    }
    return res.json(formatWithdrawal(updated));
  } catch {
    return res.status(500).json({ error: "Failed to approve withdrawal" });
  }
});

router.patch("/admin/withdrawals/:id/reject", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = RejectWithdrawalBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Rejection reason required" });
    const [wd] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id));
    if (!wd) return res.status(404).json({ error: "Withdrawal not found" });
    if (wd.status !== "pending") return res.status(400).json({ error: "Withdrawal is not pending" });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, wd.userId));
    await db.update(usersTable).set({ balance: String(Number(user.balance) + Number(wd.amount)), updatedAt: new Date() }).where(eq(usersTable.id, wd.userId));
    const [updated] = await db.update(withdrawalsTable).set({ status: "rejected", rejectionReason: parsed.data.reason, updatedAt: new Date() }).where(eq(withdrawalsTable.id, id)).returning();
    if (user) {
      sendEmail(
        user.email,
        "Withdrawal Rejected — Funds Returned",
        emailWithdrawalRejected(user.firstName, Number(wd.amount), parsed.data.reason)
      ).catch(() => {});
    }
    return res.json(formatWithdrawal(updated));
  } catch {
    return res.status(500).json({ error: "Failed to reject withdrawal" });
  }
});

export default router;
