#!/usr/bin/env node
/**
 * Zentrivex Database Seeder
 * ─────────────────────────
 * Run after database schema is pushed (drizzle-kit push).
 *
 * Usage:
 *   DATABASE_URL="postgresql://user:pass@localhost:5432/zentrivex_db" node deploy/seed-db.mjs
 *
 * Or with .env loaded:
 *   source .env && node deploy/seed-db.mjs
 *
 * What it does:
 *   1. Creates the admin user using ADMIN_SEED_PASSWORD
 *   2. Creates 4 default investment plans
 *   3. Inserts default payment settings
 */

import pg from "pg";
import bcryptjs from "bcryptjs";

const { Pool } = pg;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "support@zentrivex.com";
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD;

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function main() {
  console.log("🌱  Seeding Zentrivex database...\n");

  // ── 1. Admin user ──────────────────────────────────────────────────────────
  const existingAdmin = await query(
    "SELECT id FROM users WHERE email = $1",
    [ADMIN_EMAIL]
  );

  if (existingAdmin.length > 0) {
    console.log("✓  Admin user already exists — skipped");
  } else {
    if (!ADMIN_SEED_PASSWORD) {
      throw new Error("ADMIN_SEED_PASSWORD must be set before creating the initial admin user");
    }
    const hash = await bcryptjs.hash(ADMIN_SEED_PASSWORD, 10);
    await query(
      `INSERT INTO users
         (email, password, first_name, last_name, role, balance, kyc_status, is_active)
       VALUES ($1, $2, 'Admin', 'Zentrivex', 'admin', '0', 'approved', true)`,
      [ADMIN_EMAIL, hash]
    );
    console.log("✓  Admin user created");
    console.log(`    Email   : ${ADMIN_EMAIL}`);
    console.log("    Password: supplied through ADMIN_SEED_PASSWORD");
    console.log("    ⚠️   Change the admin password after first login!\n");
  }

  // ── 2. Investment plans ────────────────────────────────────────────────────
  const existingPlans = await query("SELECT id FROM plans LIMIT 1");

  if (existingPlans.length > 0) {
    console.log("✓  Investment plans already exist — skipped");
  } else {
    await query(`
      INSERT INTO plans
        (name, description, min_amount, max_amount, roi_percent, duration_days, is_active)
      VALUES
        ('Starter Fund',
         'Entry-level real estate and stock portfolio. Ideal for first-time investors.',
         '500', '4999', '12.5', 30, true),
        ('Growth Fund',
         'Balanced exposure to commercial real estate and blue-chip equities.',
         '5000', '24999', '22.0', 60, true),
        ('Premium Fund',
         'Priority allocation to high-yield properties and curated stock positions.',
         '25000', '99999', '32.5', 90, true),
        ('Elite Fund',
         'Exclusive access to Zentrivex flagship property portfolio and managed accounts.',
         '100000', '1000000', '42.5', 180, true)
    `);
    console.log("✓  4 investment plans created");
    console.log("    → Starter Fund  : 12.5% ROI / 30 days  ($500 – $4,999)");
    console.log("    → Growth Fund   : 22.0% ROI / 60 days  ($5,000 – $24,999)");
    console.log("    → Premium Fund  : 32.5% ROI / 90 days  ($25,000 – $99,999)");
    console.log("    → Elite Fund    : 42.5% ROI / 180 days ($100,000+)\n");
  }

  // ── 3. Default payment settings ───────────────────────────────────────────
  const existingSettings = await query(
    "SELECT key FROM settings WHERE key = 'payment_methods' LIMIT 1"
  );

  if (existingSettings.length > 0) {
    console.log("✓  Payment settings already exist — skipped");
  } else {
    const defaultMethods = JSON.stringify([
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
        note: "Send only ETH on Ethereum mainnet.",
        enabled: true,
      },
    ]);
    await query(
      "INSERT INTO settings (key, value) VALUES ('payment_methods', $1)",
      [defaultMethods]
    );
    console.log("✓  Default payment methods seeded");
  }

  console.log("\n✅  Seeding complete!");
  await pool.end();
}

main().catch((err) => {
  console.error("\n❌  Seeding failed:", err.message);
  process.exit(1);
});
