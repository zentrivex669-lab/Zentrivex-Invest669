import { db, investmentsTable, plansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { sendEmail, emailProfitCredited } from "../lib/email";

export async function processCompletedInvestments() {
  try {
    const now = new Date();

    const completedInvs = await db
      .select({
        id: investmentsTable.id,
        userId: investmentsTable.userId,
        amount: investmentsTable.amount,
        planId: investmentsTable.planId,
        roiPercent: plansTable.roiPercent,
        planName: plansTable.name,
      })
      .from(investmentsTable)
      .innerJoin(plansTable, eq(investmentsTable.planId, plansTable.id))
      .where(
        and(
          eq(investmentsTable.status, "active"),
          lte(investmentsTable.endDate, now)
        )
      );

    if (completedInvs.length === 0) return;

    for (const inv of completedInvs) {
      const amount = Number(inv.amount);
      const roiPercent = Number(inv.roiPercent);
      const profit = parseFloat((amount * (roiPercent / 100)).toFixed(8));
      const totalReturn = parseFloat((amount + profit).toFixed(8));

      await db
        .update(investmentsTable)
        .set({
          status: "completed",
          profit: profit.toString(),
          updatedAt: new Date(),
        })
        .where(eq(investmentsTable.id, inv.id));

      await db
        .update(usersTable)
        .set({
          balance: sql`balance + ${totalReturn}`,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, inv.userId));

      await db.insert(transactionsTable).values({
        userId: inv.userId,
        type: "profit",
        amount: totalReturn.toString(),
        status: "completed",
        description: `Investment matured: ${inv.planName} — principal $${amount.toLocaleString()} + profit $${profit.toLocaleString()}`,
      });

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, inv.userId));
      if (user) {
        sendEmail(
          user.email,
          `Profit Credited — ${inv.planName} Investment Matured 💰`,
          emailProfitCredited(user.firstName, inv.planName, Number(inv.amount), profit, totalReturn)
        ).catch(() => {});
      }
      logger.info(
        { investmentId: inv.id, userId: inv.userId, profit, totalReturn },
        "Investment completed — profit distributed"
      );
    }

    logger.info({ count: completedInvs.length }, "Profit distribution batch complete");
  } catch (e) {
    logger.error({ err: e }, "Error in profit distribution job");
  }
}

export function startProfitDistributionJob() {
  // Run every 60 seconds
  setInterval(processCompletedInvestments, 60 * 1000);
  // Run once immediately on startup
  processCompletedInvestments();
  logger.info("Profit distribution job started (runs every 60s)");
}
