import { Router } from "express";
import { db, kycTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { SubmitKycBody, RejectKycBody } from "@workspace/api-zod";
import {
  sendEmail,
  emailKycSubmitted,
  emailKycApproved,
  emailKycRejected,
} from "../lib/email";

const router = Router();

function formatKyc(k: typeof kycTable.$inferSelect, user?: typeof usersTable.$inferSelect | null) {
  return {
    ...k,
    reviewedAt: k.reviewedAt ? k.reviewedAt.toISOString() : null,
    user: user ? { ...user, balance: Number(user.balance), password: undefined } : undefined,
  };
}

router.get("/kyc", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [kyc] = await db.select().from(kycTable).where(eq(kycTable.userId, req.userId!));
    if (!kyc) return res.status(404).json({ error: "KYC not found" });
    return res.json(formatKyc(kyc));
  } catch {
    return res.status(404).json({ error: "KYC not found" });
  }
});

router.post("/kyc", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const parsed = SubmitKycBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const existing = await db.select().from(kycTable).where(eq(kycTable.userId, req.userId!));
    if (existing.length > 0 && existing[0].status === "approved") {
      return res.status(400).json({ error: "KYC already approved" });
    }
    let kyc;
    if (existing.length > 0) {
      const [updated] = await db.update(kycTable).set({ ...parsed.data, status: "pending", rejectionReason: null, reviewedAt: null, updatedAt: new Date() }).where(eq(kycTable.userId, req.userId!)).returning();
      kyc = updated;
    } else {
      const [created] = await db.insert(kycTable).values({ userId: req.userId!, ...parsed.data }).returning();
      kyc = created;
    }
    await db.update(usersTable).set({ kycStatus: "pending", updatedAt: new Date() }).where(eq(usersTable.id, req.userId!));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (user) {
      sendEmail(
        user.email,
        "KYC Submitted for Review — Zentrivex",
        emailKycSubmitted(user.firstName)
      ).catch(() => {});
    }
    return res.status(201).json(formatKyc(kyc));
  } catch {
    return res.status(500).json({ error: "Failed to submit KYC" });
  }
});

router.get("/admin/kyc", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const kycs = await db.select().from(kycTable);
    const users = await db.select().from(usersTable);
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    return res.json(kycs.map(k => formatKyc(k, userMap[k.userId])));
  } catch {
    return res.status(500).json({ error: "Failed to fetch KYC" });
  }
});

router.patch("/admin/kyc/:id/approve", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [kyc] = await db.select().from(kycTable).where(eq(kycTable.id, id));
    if (!kyc) return res.status(404).json({ error: "KYC not found" });
    const [updated] = await db.update(kycTable).set({ status: "approved", reviewedAt: new Date(), updatedAt: new Date() }).where(eq(kycTable.id, id)).returning();
    await db.update(usersTable).set({ kycStatus: "approved", updatedAt: new Date() }).where(eq(usersTable.id, kyc.userId));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, kyc.userId));
    if (user) {
      sendEmail(
        user.email,
        "Identity Verified — Your KYC is Approved ✓",
        emailKycApproved(user.firstName)
      ).catch(() => {});
    }
    return res.json(formatKyc(updated));
  } catch {
    return res.status(500).json({ error: "Failed to approve KYC" });
  }
});

router.patch("/admin/kyc/:id/reject", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = RejectKycBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Rejection reason required" });
    const [kyc] = await db.select().from(kycTable).where(eq(kycTable.id, id));
    if (!kyc) return res.status(404).json({ error: "KYC not found" });
    const [updated] = await db.update(kycTable).set({ status: "rejected", rejectionReason: parsed.data.reason, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(kycTable.id, id)).returning();
    await db.update(usersTable).set({ kycStatus: "rejected", updatedAt: new Date() }).where(eq(usersTable.id, kyc.userId));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, kyc.userId));
    if (user) {
      sendEmail(
        user.email,
        "KYC Verification Failed — Action Required",
        emailKycRejected(user.firstName, parsed.data.reason)
      ).catch(() => {});
    }
    return res.json(formatKyc(updated));
  } catch {
    return res.status(500).json({ error: "Failed to reject KYC" });
  }
});

export default router;
