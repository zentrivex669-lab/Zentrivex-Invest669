import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, generateToken, type AuthRequest } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { sendEmail, emailWelcome } from "../lib/email";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { email, password, firstName, lastName, phone } = parsed.data;
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) return res.status(400).json({ error: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      email, password: hashed, firstName, lastName, phone: phone ?? null
    }).returning();
    const token = generateToken(user.id, user.role);
    const { password: _, ...safeUser } = user;
    sendEmail(
      user.email,
      "Welcome to Zentrivex — Your Account is Ready 🎉",
      emailWelcome(user.firstName, user.email)
    ).catch(() => {});
    return res.status(201).json({ user: { ...safeUser, balance: Number(user.balance) }, token });
  } catch (e) {
    return res.status(500).json({ error: "Registration failed" });
  }
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
