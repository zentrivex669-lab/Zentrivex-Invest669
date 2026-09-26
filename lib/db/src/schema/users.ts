import { pgTable, serial, text, numeric, boolean, timestamp, pgEnum, integer, unique, type AnyPgColumn } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["none", "pending", "approved", "rejected"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  role: userRoleEnum("role").notNull().default("user"),
  balance: numeric("balance", { precision: 18, scale: 8 }).notNull().default("0"),
  kycStatus: kycStatusEnum("kyc_status").notNull().default("none"),
  isActive: boolean("is_active").notNull().default(true),
  referralCode: text("referral_code"),
  referredBy: integer("referred_by").references((): AnyPgColumn => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [unique("users_referral_code_key").on(table.referralCode)]);

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
