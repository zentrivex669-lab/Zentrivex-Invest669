import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, generateToken, type AuthRequest } from "../middlewares/auth";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", (_req, res) => {
  return res.status(403).json({ error: "Registration is currently disabled" });
});

router.post("/auth/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { email, password } = parsed.data;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.isActive) return res.status(401).json({ error: "Account disabled" });
    if (user.role !== "admin") return res.status(403).json({ error: "Admin access only" });
    const token = generateToken(user.id, user.role);
    const { password: _, ...safeUser } = user;
    return res.json({ user: { ...safeUser, balance: Number(user.balance) }, token });
  } catch (e) {
    return res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
    if (!user) return res.status(401).json({ error: "User not found" });
    const { password: _, ...safeUser } = user;
    return res.json({ ...safeUser, balance: Number(user.balance) });
  } catch (e) {
    return res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/auth/logout", (req, res) => {
  return res.json({ success: true });
});

export default router;
