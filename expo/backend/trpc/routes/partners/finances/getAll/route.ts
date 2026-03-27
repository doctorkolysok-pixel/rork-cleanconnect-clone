import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { partnerFinances, orders } from "../../../../../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const getPartnerFinancesProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    let query = db
      .select({
        id: partnerFinances.id,
        orderId: partnerFinances.orderId,
        amount: partnerFinances.amount,
        platformFee: partnerFinances.platformFee,
        netAmount: partnerFinances.netAmount,
        status: partnerFinances.status,
        paidAt: partnerFinances.paidAt,
        createdAt: partnerFinances.createdAt,
        orderCategory: orders.category,
      })
      .from(partnerFinances)
      .leftJoin(orders, eq(orders.id, partnerFinances.orderId))
      .where(eq(partnerFinances.partnerId, ctx.userId));

    if (input.startDate) {
      query = query.where(
        and(
          eq(partnerFinances.partnerId, ctx.userId),
          gte(partnerFinances.createdAt, input.startDate)
        )
      ) as typeof query;
    }

    if (input.endDate) {
      query = query.where(
        and(
          eq(partnerFinances.partnerId, ctx.userId),
          lte(partnerFinances.createdAt, input.endDate)
        )
      ) as typeof query;
    }

    const finances = await query;

    const totalEarnings = finances.reduce((sum, f) => sum + f.netAmount, 0);
    const totalFees = finances.reduce((sum, f) => sum + f.platformFee, 0);
    const pendingAmount = finances
      .filter((f) => f.status === "pending")
      .reduce((sum, f) => sum + f.netAmount, 0);

    return {
      finances,
      summary: {
        totalEarnings,
        totalFees,
        pendingAmount,
        paidAmount: totalEarnings - pendingAmount,
      },
    };
  });

export default getPartnerFinancesProcedure;
