import { Router } from "express";
import { db, settingsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { z } from "zod";

const router = Router();

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: "wire",
    label: "Wire Transfer",
    type: "bank",
    details: "Account: 8823-4491-002 | Routing: 021000021 | Bank: JPMorgan Chase | Beneficiary: Zentrivex Ltd",
    note: "Wire transfers clear in 1–3 business days. Include your email as reference.",
    enabled: true,
  },
  {
    id: "usdt_trc20",
    label: "USDT (TRC-20)",
    type: "crypto",
    address: "TGJHn3yCLXBvqxHpLHsJN3VuUFekiQPJsW",
    note: "Send only USDT on TRON (TRC-20). Min deposit: $50.",
    enabled: true,
  },
  {
    id: "btc",
    label: "Bitcoin (BTC)",
    type: "crypto",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    note: "Send only BTC. Credited after 3 confirmations.",
    enabled: true,
  },
  {
    id: "eth",
    label: "Ethereum (ETH)",
    type: "crypto",
    address: "0x742d35Cc6634C0532925a3b8D4C9B4E9f5a2E7a1",
    note: "Send only ETH on Ethereum mainnet. Do not send ERC-20 tokens.",
    enabled: true,
  },
  {
    id: "usdt_erc20",
    label: "USDT (ERC-20)",
    type: "crypto",
    address: "0x742d35Cc6634C0532925a3b8D4C9B4E9f5a2E7a1",
    note: "Send only USDT on Ethereum (ERC-20) network.",
    enabled: false,
  },
  {
    id: "bnb",
    label: "BNB (BEP-20)",
    type: "crypto",
    address: "0x742d35Cc6634C0532925a3b8D4C9B4E9f5a2E7a1",
    note: "Send only BNB on BSC (BEP-20) network.",
    enabled: false,
  },
  {
    id: "sol",
    label: "Solana (SOL)",
    type: "crypto",
    address: "8yS3N3aVcD5YWyEmPkrTvnCnEBRBMsyuX5HH7wW2Zj3",
    note: "Send only SOL on the Solana mainnet.",
    enabled: false,
  },
  {
    id: "ltc",
    label: "Litecoin (LTC)",
    type: "crypto",
    address: "ltc1qh9yjvj8prwldkh0ykzxhzqr6xncvy5k7p8gmrn",
    note: "Send only LTC on the Litecoin network.",
    enabled: false,
  },
];

export const DEFAULT_HOMEPAGE = {
  heroTitle: "Build Lasting Wealth Through Premium Assets",
  heroHighlight: "Wealth Through",
  heroSubtitle: "Zentrivex pools investor capital into premium real estate properties and professionally managed stock portfolios — delivering consistent, above-market returns since 2015.",
  stat1Label: "Assets Under Management",
  stat1Value: "$1.4B+",
  stat2Label: "Avg. Annual Return",
  stat2Value: "28.4%",
  stat3Label: "Years Experience",
  stat3Value: "9 yrs",
  stat4Label: "Active Investors",
  stat4Value: "24K+",
  ctaButtonText: "Start Investing",
  badgeText: "REAL ESTATE & STOCK MARKET INVESTMENTS",
  footerDisclaimer: "© 2026 Zentrivex Ltd. All rights reserved. Investments carry risk. Past performance is not indicative of future results.",
};

export const DEFAULT_REFERRAL_SETTINGS = {
  enabled: true,
  bonusPercent: 5,
};

async function getSetting(key: string, defaultValue: unknown) {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  if (!row) return defaultValue;
  try { return JSON.parse(row.value); } catch { return defaultValue; }
}

async function setSetting(key: string, value: unknown) {
  const json = JSON.stringify(value);
  const existing = await db.select().from(settingsTable).where(eq(settingsTable.key, key));
  if (existing.length > 0) {
    await db.update(settingsTable).set({ value: json, updatedAt: new Date() }).where(eq(settingsTable.key, key));
  } else {
    await db.insert(settingsTable).values({ key, value: json });
  }
}

router.get("/settings/payment", async (_req, res) => {
  try {
    const methods = await getSetting("payment_methods", DEFAULT_PAYMENT_METHODS);
    return res.json(methods);
  } catch {
    return res.status(500).json({ error: "Failed to load payment settings" });
  }
});

router.put("/admin/settings/payment", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const schema = z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      type: z.enum(["bank", "crypto"]),
      details: z.string().optional(),
      address: z.string().optional(),
      note: z.string().optional(),
      enabled: z.boolean(),
    }));
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payment methods data" });
    await setSetting("payment_methods", parsed.data);
    return res.json({ ok: true, methods: parsed.data });
  } catch {
    return res.status(500).json({ error: "Failed to save payment settings" });
  }
});

router.get("/settings/homepage", async (_req, res) => {
  try {
    const settings = await getSetting("homepage", DEFAULT_HOMEPAGE);
    return res.json(settings);
  } catch {
    return res.status(500).json({ error: "Failed to load homepage settings" });
  }
});

router.put("/admin/settings/homepage", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const current = await getSetting("homepage", DEFAULT_HOMEPAGE);
    const updated = { ...(current as object), ...req.body };
    await setSetting("homepage", updated);
    return res.json({ ok: true, settings: updated });
  } catch {
    return res.status(500).json({ error: "Failed to save homepage settings" });
  }
});

router.get("/settings/referral", async (_req, res) => {
  try {
    const settings = await getSetting("referral_settings", DEFAULT_REFERRAL_SETTINGS);
    return res.json(settings);
  } catch {
    return res.status(500).json({ error: "Failed to load referral settings" });
  }
});

router.put("/admin/settings/referral", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      enabled: z.boolean(),
      bonusPercent: z.number().min(0).max(100),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid referral settings data" });
    await setSetting("referral_settings", parsed.data);
    return res.json(parsed.data);
  } catch {
    return res.status(500).json({ error: "Failed to save referral settings" });
  }
});

const FullUserUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  balance: z.number().min(0).optional(),
  kycStatus: z.enum(["none", "pending", "approved", "rejected"]).optional(),
  role: z.enum(["user", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

router.patch("/admin/users/:id/edit", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid user ID" });
    const parsed = FullUserUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { balance, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest, updatedAt: new Date() };
    if (balance !== undefined) updates.balance = balance.toString();
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    return res.json({ ...safeUser, balance: Number(user.balance) });
  } catch {
    return res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
