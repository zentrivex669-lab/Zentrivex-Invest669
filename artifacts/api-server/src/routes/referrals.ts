import { Router } from "express";
import { db, usersTable, depositsTable, transactionsTable, settingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { DEFAULT_REFERRAL_SETTINGS } from "./settings";

const router = Router();

async function getReferralSettings() {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "referral_settings"));
  if (!row) return DEFAULT_REFERRAL_SETTINGS;
  try { return JSON.parse(row.value); } catch { return DEFAULT_REFERRAL_SETTINGS; }
}

router.get("/referrals", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const settings = await getReferralSettings();
    const referredUsers = await db.select().from(usersTable).where(eq(usersTable.referredBy, userId));

    const referredUsersWithStatus = await Promise.all(
      referredUsers.map(async (u) => {
        const approvedDeposits = await db.select().from(depositsTable).where(
          and(eq(depositsTable.userId, u.id), eq(depositsTable.status, "approved"))
        );
        return {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          createdAt: u.createdAt,
          hasDeposited: approvedDeposits.length > 0,
        };
      })
    );

    const referralTransactions = await db.select().from(transactionsTable).where(
      and(eq(transactionsTable.userId, userId), eq(transactionsTable.type, "referral"))
    );
    const totalEarned = referralTransactions.reduce((s, t) => s + Number(t.amount), 0);

    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const referralLink = `${protocol}://${host}/register?ref=${user.referralCode}`;

    return res.json({
      referralCode: user.referralCode,
      referralLink,
      totalReferred: referredUsersWithStatus.length,
      totalEarned,
      bonusPercent: settings.bonusPercent,
      enabled: settings.enabled,
      referredUsers: referredUsersWithStatus,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch referral data" });
  }
});

export default router;
