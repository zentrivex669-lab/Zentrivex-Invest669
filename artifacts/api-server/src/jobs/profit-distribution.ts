import { db, investmentsTable, plansTable, usersTable, transactionsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { sendEmail, emailProfitCredited } from "../lib/email";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function roundAmount(value: number): number {
  return Number(value.toFixed(8));
}

type MaturityNotice = {
  investmentId: number;
  userId: number;
  planName: string;
  amount: number;
  totalProfit: number;
};

async function processInvestment(investmentId: number): Promise<MaturityNotice | null> {
  return db.transaction(async (tx) => {
    const [investment] = await tx
      .select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, investmentId))
      .for("update");

    if (!investment || investment.status !== "active") return null;

    const [plan] = await tx.select().from(plansTable).where(eq(plansTable.id, investment.planId));
    if (!plan) throw new Error(`Plan ${investment.planId} is missing for investment ${investment.id}`);

    const now = new Date();
    const amount = Number(investment.amount);
    const durationDays = Math.max(
      1,
      Math.round((investment.endDate.getTime() - investment.startDate.getTime()) / MS_PER_DAY),
    );
    const roiPercent = Number(investment.roiPercent ?? plan.roiPercent);
    const totalProfit = roundAmount(amount * (roiPercent / 100));
    const matured = now >= investment.endDate;
    const elapsedMs = Math.max(0, Math.min(now.getTime(), investment.endDate.getTime()) - investment.startDate.getTime());
    const elapsedPeriods = matured
      ? durationDays
      : Math.min(durationDays, Math.floor(elapsedMs / MS_PER_DAY));
    const previouslyCreditedPeriods = Math.min(
      durationDays,
      Math.max(0, Math.floor((investment.lastProfitAt.getTime() - investment.startDate.getTime()) / MS_PER_DAY)),
    );
    const newPeriods = Math.max(0, elapsedPeriods - previouslyCreditedPeriods);
    const creditedProfit = Number(investment.profit);
    const profitTarget = elapsedPeriods >= durationDays
      ? totalProfit
      : roundAmount(totalProfit * elapsedPeriods / durationDays);
    const profitCredit = roundAmount(Math.max(0, profitTarget - creditedProfit));
    const updatedProfit = roundAmount(creditedProfit + profitCredit);

    if (profitCredit > 0 || matured) {
      await tx
        .update(investmentsTable)
        .set({
          roiPercent: investment.roiPercent ?? String(plan.roiPercent),
          profit: updatedProfit.toFixed(8),
          lastProfitAt: matured
            ? investment.endDate
            : new Date(investment.startDate.getTime() + elapsedPeriods * MS_PER_DAY),
          status: matured ? "completed" : "active",
          updatedAt: now,
        })
        .where(eq(investmentsTable.id, investment.id));
    } else if (investment.roiPercent === null) {
      await tx
        .update(investmentsTable)
        .set({ roiPercent: String(plan.roiPercent), updatedAt: now })
        .where(eq(investmentsTable.id, investment.id));
    }

    const balanceCredit = roundAmount(profitCredit + (matured ? amount : 0));
    if (balanceCredit > 0) {
      await tx
        .update(usersTable)
        .set({
          balance: sql`balance + ${balanceCredit}`,
          updatedAt: now,
        })
        .where(eq(usersTable.id, investment.userId));
    }

    if (profitCredit > 0) {
      await tx.insert(transactionsTable).values({
        userId: investment.userId,
        type: "profit",
        amount: profitCredit.toFixed(8),
        status: "completed",
        description: `Daily profit — ${plan.name} (${newPeriods} 24-hour period${newPeriods === 1 ? "" : "s"})`,
        investmentId: investment.id,
      });
      logger.info(
        { investmentId: investment.id, userId: investment.userId, profitCredit, newPeriods },
        "Daily profit credited to withdrawable balance",
      );
    }

    if (!matured) return null;

    await tx.insert(transactionsTable).values({
      userId: investment.userId,
      type: "principal_return",
      amount: amount.toFixed(8),
      status: "completed",
      description: `Capital released at maturity — ${plan.name}`,
      investmentId: investment.id,
    });

    return {
      investmentId: investment.id,
      userId: investment.userId,
      planName: plan.name,
      amount,
      totalProfit: updatedProfit,
    };
  });
}

async function processInvestmentIds(investmentIds: number[]): Promise<void> {
  for (const id of investmentIds) {
    try {
      const notice = await processInvestment(id);
      if (!notice) continue;

      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, notice.userId));
      if (user) {
        sendEmail(
          user.email,
          `Investment Matured — ${notice.planName} Capital Unlocked`,
          emailProfitCredited(
            user.firstName,
            notice.planName,
            notice.amount,
            notice.totalProfit,
            notice.amount + notice.totalProfit,
          ),
        ).catch((err) => logger.warn({ err, investmentId: notice.investmentId }, "Maturity email could not be sent"));
      }

      logger.info(
        { investmentId: notice.investmentId, userId: notice.userId, totalProfit: notice.totalProfit, principalReturned: notice.amount },
        "Investment matured — capital released to withdrawable balance",
      );
    } catch (err) {
      logger.error({ err, investmentId: id }, "Could not process investment profit");
    }
  }
}

export async function processDailyProfits(): Promise<void> {
  const activeInvestments = await db
    .select({ id: investmentsTable.id })
    .from(investmentsTable)
    .where(eq(investmentsTable.status, "active"));
  await processInvestmentIds(activeInvestments.map(({ id }) => id));
}

export async function processDailyProfitsForUser(userId: number): Promise<void> {
  const activeInvestments = await db
    .select({ id: investmentsTable.id })
    .from(investmentsTable)
    .where(and(eq(investmentsTable.status, "active"), eq(investmentsTable.userId, userId)));
  await processInvestmentIds(activeInvestments.map(({ id }) => id));
}

export function startProfitDistributionJob() {
  // Run every minute. Row locks make overlapping server/cron invocations idempotent.
  setInterval(() => {
    processDailyProfits().catch((err) => logger.error({ err }, "Scheduled profit distribution failed"));
  }, 60 * 1000);
  processDailyProfits().catch((err) => logger.error({ err }, "Initial profit distribution failed"));
  logger.info("Profit distribution job started (runs every 60 seconds)");
}
