import { Router } from "express";
import { db, depositsTable, withdrawalsTable, investmentsTable, transactionsTable, usersTable, kycTable, plansTable } from "@workspace/db";
import { eq, sum, count } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const deps = await db.select().from(depositsTable).where(eq(depositsTable.userId, userId));
    const wds = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, userId));
    const invs = await db.select().from(investmentsTable).where(eq(investmentsTable.userId, userId));
    const totalDeposited = deps.filter(d => d.status === "approved").reduce((s, d) => s + Number(d.amount), 0);
    const totalWithdrawn = wds.filter(w => w.status === "approved").reduce((s, w) => s + Number(w.amount), 0);
    const totalInvested = invs.reduce((s, i) => s + Number(i.amount), 0);
    const totalProfit = invs.reduce((s, i) => s + Number(i.profit), 0);
    const activeInvestments = invs.filter(i => i.status === "active").length;
    const pendingDeposits = deps.filter(d => d.status === "pending").length;
    const pendingWithdrawals = wds.filter(w => w.status === "pending").length;
    return res.json({
      balance: Number(user.balance),
      totalInvested,
      totalProfit,
      totalDeposited,
      totalWithdrawn,
      activeInvestments,
      pendingDeposits,
      pendingWithdrawals,
      kycStatus: user.kycStatus,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

router.get("/admin/dashboard", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable);
    const deps = await db.select().from(depositsTable);
    const wds = await db.select().from(withdrawalsTable);
    const invs = await db.select().from(investmentsTable);
    const kycs = await db.select().from(kycTable);
    const totalDeposits = deps.filter(d => d.status === "approved").reduce((s, d) => s + Number(d.amount), 0);
    const totalWithdrawals = wds.filter(w => w.status === "approved").reduce((s, w) => s + Number(w.amount), 0);
    const totalInvestments = invs.reduce((s, i) => s + Number(i.amount), 0);
    const pendingDeposits = deps.filter(d => d.status === "pending").length;
    const pendingWithdrawals = wds.filter(w => w.status === "pending").length;
    const pendingKyc = kycs.filter(k => k.status === "pending").length;
    const platformBalance = users.reduce((s, u) => s + Number(u.balance), 0);
    const userMap = Object.fromEntries(users.map(u => [u.id, { ...u, balance: Number(u.balance), password: undefined }]));
    const recentDeposits = deps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(d => ({ ...d, amount: Number(d.amount), approvedAt: d.approvedAt?.toISOString() ?? null, user: userMap[d.userId] }));
    const recentWithdrawals = wds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map(w => ({ ...w, amount: Number(w.amount), approvedAt: w.approvedAt?.toISOString() ?? null, user: userMap[w.userId] }));
    return res.json({
      totalUsers: users.filter(u => u.role === "user").length,
      totalDeposits,
      totalWithdrawals,
      totalInvestments,
      pendingDeposits,
      pendingWithdrawals,
      pendingKyc,
      platformBalance,
      recentDeposits,
      recentWithdrawals,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch admin dashboard" });
  }
});

router.get("/transactions", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.userId!));
    return res.json(txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(t => ({ ...t, amount: Number(t.amount) })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.get("/admin/users", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable);
    return res.json(users.map(u => ({ ...u, balance: Number(u.balance), password: undefined })));
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/admin/users/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    return res.json({ ...safeUser, balance: Number(user.balance) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/admin/users/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive, balance, role } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (isActive !== undefined) updates.isActive = isActive;
    if (balance !== undefined) updates.balance = String(balance);
    if (role !== undefined) updates.role = role;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    return res.json({ ...safeUser, balance: Number(user.balance) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
