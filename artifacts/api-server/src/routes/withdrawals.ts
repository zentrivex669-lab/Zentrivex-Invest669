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
import { logger } from "../lib/logger";
import { processDailyProfitsForUser } from "../jobs/profit-distribution";

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
    const normalizedAmount = Number(amount.toFixed(8));
    if (normalizedAmount < 10) return res.status(400).json({ error: "Minimum withdrawal is $10.00" });
    await processDailyProfitsForUser(req.userId!);

    const result = await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, req.userId!))
        .for("update");
      if (!user) return { error: "User not found", status: 404 as const };
      if (Number(user.balance) < normalizedAmount) {
        return { error: "Insufficient withdrawable balance", status: 400 as const };
      }

      const now = new Date();
      await tx.update(usersTable).set({
        balance: (Number(user.balance) - normalizedAmount).toFixed(8),
        updatedAt: now,
      }).where(eq(usersTable.id, req.userId!));
      const [wd] = await tx.insert(withdrawalsTable).values({
        userId: req.userId!,
        amount: normalizedAmount.toFixed(8),
        walletAddress,
        network: network ?? null,
      }).returning();
      await tx.insert(transactionsTable).values({
        userId: req.userId!,
        type: "withdrawal",
        amount: normalizedAmount.toFixed(8),
        status: "pending",
        description: `Withdrawal of $${normalizedAmount} to ${walletAddress.slice(0, 10)}... pending approval`,
      });
      return { wd, user };
    });

    if ("error" in result) return res.status(result.status ?? 400).json({ error: result.error });

    sendEmail(
      result.user.email,
      "Withdrawal Request Received — Zentrivex",
      emailWithdrawalSubmitted(result.user.firstName, normalizedAmount, walletAddress, new Date())
    ).catch((err) => logger.warn({ err, userId: req.userId }, "Withdrawal submission email could not be sent"));
    return res.status(201).json(formatWithdrawal(result.wd));
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
    const id = parseInt(String(req.params.id), 10);
    const result = await db.transaction(async (tx) => {
      const [wd] = await tx.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).for("update");
      if (!wd) return { error: "Withdrawal not found", status: 404 as const };
      if (wd.status !== "pending") return { error: "Withdrawal is not pending", status: 400 as const };

      const now = new Date();
      const [updated] = await tx.update(withdrawalsTable).set({
        status: "approved",
        approvedAt: now,
        updatedAt: now,
      }).where(eq(withdrawalsTable.id, id)).returning();
      await tx.insert(transactionsTable).values({
        userId: wd.userId,
        type: "withdrawal",
        amount: wd.amount,
        status: "completed",
        description: `Withdrawal of $${wd.amount} approved`,
      });
      const [user] = await tx.select().from(usersTable).where(eq(usersTable.id, wd.userId));
      return { updated, user, wd };
    });
    if ("error" in result) return res.status(result.status ?? 400).json({ error: result.error });

    if (result.user) {
      sendEmail(
        result.user.email,
        "Withdrawal Approved — Funds Sent",
        emailWithdrawalApproved(result.user.firstName, Number(result.wd.amount), result.wd.walletAddress)
      ).catch((err) => logger.warn({ err, withdrawalId: id }, "Withdrawal approval email could not be sent"));
    }
    return res.json(formatWithdrawal(result.updated));
  } catch {
    return res.status(500).json({ error: "Failed to approve withdrawal" });
  }
});

router.patch("/admin/withdrawals/:id/reject", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const parsed = RejectWithdrawalBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Rejection reason required" });
    const result = await db.transaction(async (tx) => {
      const [wd] = await tx.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, id)).for("update");
      if (!wd) return { error: "Withdrawal not found", status: 404 as const };
      if (wd.status !== "pending") return { error: "Withdrawal is not pending", status: 400 as const };
      const [user] = await tx.select().from(usersTable).where(eq(usersTable.id, wd.userId)).for("update");
      if (!user) return { error: "User not found", status: 404 as const };

      const now = new Date();
      await tx.update(usersTable).set({
        balance: (Number(user.balance) + Number(wd.amount)).toFixed(8),
        updatedAt: now,
      }).where(eq(usersTable.id, wd.userId));
      const [updated] = await tx.update(withdrawalsTable).set({
        status: "rejected",
        rejectionReason: parsed.data.reason,
        updatedAt: now,
      }).where(eq(withdrawalsTable.id, id)).returning();
      return { updated, user, wd };
    });
    if ("error" in result) return res.status(result.status ?? 400).json({ error: result.error });

    sendEmail(
      result.user.email,
      "Withdrawal Rejected — Funds Returned",
      emailWithdrawalRejected(result.user.firstName, Number(result.wd.amount), parsed.data.reason)
    ).catch((err) => logger.warn({ err, withdrawalId: id }, "Withdrawal rejection email could not be sent"));
    return res.json(formatWithdrawal(result.updated));
  } catch {
    return res.status(500).json({ error: "Failed to reject withdrawal" });
  }
});

export default router;
