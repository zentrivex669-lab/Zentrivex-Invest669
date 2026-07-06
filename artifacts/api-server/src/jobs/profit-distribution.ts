import { db, investmentsTable, plansTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { sendEmail, emailProfitCredited } from "../lib/email";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function processDailyProfits() {
  try {
    const now = new Date();

    const activeInvs = await db
      .select({
        id: investmentsTable.id,
        userId: investmentsTable.userId,
        amount: investmentsTable.amount,
        profit: investmentsTable.profit,
        planId: investmentsTable.planId,
        startDate: investmentsTable.startDate,
        endDate: investmentsTable.endDate,
        lastProfitAt: investmentsTable.lastProfitAt,
        roiPercent: plansTable.roiPercent,
        durationDays: plansTable.durationDays,
        planName: plansTable.name,
      })
      .from(investmentsTable)
      .innerJoin(plansTable, eq(investmentsTable.planId, plansTable.id))
      .where(eq(investmentsTable.status, "active"));

    if (activeInvs.length === 0) return;

    for (const inv of activeInvs) {
      const amount = Number(inv.amount);
      const roiPercent = Number(inv.roiPercent);
      const durationDays = inv.durationDays;
      const totalProfit = parseFloat((amount * (roiPercent / 100)).toFixed(8));
      const dailyProfit = parseFloat((totalProfit / durationDays).toFixed(8));

      const effectiveNow = now < inv.endDate ? now : inv.endDate;
      const daysElapsedTotal = Math.min(
        durationDays,
        Math.floor((effectiveNow.getTime() - inv.startDate.getTime()) / MS_PER_DAY)
      );
      const daysAlreadyCredited = Math.floor(
        (inv.lastProfitAt.getTime() - inv.startDate.getTime()) / MS_PER_DAY
      );
      const newDays = daysElapsedTotal - daysAlreadyCredited;

      if (newDays > 0) {
        const creditAmount = parseFloat((dailyProfit * newDays).toFixed(8));
        const newLastProfitAt = new Date(inv.startDate.getTime() + daysElapsedTotal * MS_PER_DAY);

        await db
          .update(investmentsTable)
          .set({
            profit: sql`profit + ${creditAmount}`,
            lastProfitAt: newLastProfitAt,
            updatedAt: new Date(),
          })
          .where(eq(investmentsTable.id, inv.id));

        await db
          .update(usersTable)
          .set({
            balance: sql`balance + ${creditAmount}`,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, inv.userId));

        await db.insert(transactionsTable).values({
          userId: inv.userId,
          type: "profit",
          amount: creditAmount.toString(),
          status: "completed",
          description: `Daily profit — ${inv.planName} (${newDays} day${newDays > 1 ? "s" : ""})`,
          investmentId: inv.id,
        });

        logger.info(
          { investmentId: inv.id, userId: inv.userId, creditAmount, newDays },
          "Daily profit credited — withdrawable, capital remains locked"
        );
      }

      if (now >= inv.endDate) {
        const [freshInv] = await db.select().from(investmentsTable).where(eq(investmentsTable.id, inv.id));
        if (!freshInv || freshInv.status !== "active") continue;

        const creditedProfit = Number(freshInv.profit);
        const remainder = parseFloat((totalProfit - creditedProfit).toFixed(8));
        const finalProfitAdjustment = remainder > 0 ? remainder : 0;
        const principalAndRemainder = parseFloat((amount + finalProfitAdjustment).toFixed(8));

        await db
          .update(investmentsTable)
          .set({
            status: "completed",
            profit: totalProfit.toString(),
            updatedAt: new Date(),
          })
          .where(eq(investmentsTable.id, inv.id));

        await db
          .update(usersTable)
          .set({
            balance: sql`balance + ${principalAndRemainder}`,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, inv.userId));

        await db.insert(transactionsTable).values({
          userId: inv.userId,
          type: "profit",
          amount: principalAndRemainder.toString(),
          status: "completed",
          description: `Investment matured: ${inv.planName} — principal $${amount.toLocaleString()} returned${finalProfitAdjustment > 0 ? ` + final profit $${finalProfitAdjustment.toLocaleString()}` : ""}`,
          investmentId: inv.id,
        });

        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, inv.userId));
        if (user) {
          sendEmail(
            user.email,
            `Investment Matured — ${inv.planName} Capital Unlocked 💰`,
            emailProfitCredited(user.firstName, inv.planName, amount, totalProfit, amount + totalProfit)
          ).catch(() => {});
        }
        logger.info(
          { investmentId: inv.id, userId: inv.userId, totalProfit, principalReturned: amount },
          "Investment matured — principal unlocked and returned to balance"
        );
      }
    }
  } catch (e) {
    logger.error({ err: e }, "Error in profit distribution job");
  }
}

export function startProfitDistributionJob() {
  // Run every 60 seconds: credits accrued daily profit (withdrawable immediately)
  // and unlocks principal only once an investment's duration has fully elapsed.
  setInterval(processDailyProfits, 60 * 1000);
  // Run once immediately on startup
  processDailyProfits();
  logger.info("Profit distribution job started (runs every 60s, credits profit daily)");
}
