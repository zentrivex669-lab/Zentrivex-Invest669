import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { txStatusEnum } from "./deposits";

export const documentTypeEnum = pgEnum("document_type", ["passport", "drivers_license", "national_id"]);

export const kycTable = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  // Personal information
  fullName: text("full_name"),
  dateOfBirth: text("date_of_birth"),
  nationality: text("nationality"),
  phone: text("phone"),
  // Address
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postalCode: text("postal_code"),
  // Documents
  documentType: documentTypeEnum("document_type").notNull(),
  frontImage: text("front_image"),
  backImage: text("back_image"),
  selfieImage: text("selfie_image"),
  // Status
  status: txStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKycSchema = createInsertSchema(kycTable).omit({ id: true, createdAt: true, updatedAt: true, status: true, reviewedAt: true, rejectionReason: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type Kyc = typeof kycTable.$inferSelect;
