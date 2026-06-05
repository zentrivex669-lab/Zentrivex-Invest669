import { pgTable, serial, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const txStatusEnum = pgEnum("tx_status", ["pending", "approved", "rejected"]);

export const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").notNull(),
  walletAddress: text("wallet_address").notNull(),
  txHash: text("tx_hash"),
  proofImage: text("proof_image"),
  status: txStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDepositSchema = createInsertSchema(depositsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, approvedAt: true, rejectionReason: true });
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof depositsTable.$inferSelect;
