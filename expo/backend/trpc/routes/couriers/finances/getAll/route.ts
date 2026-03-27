import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { courierFinances, courierDeliveries } from "../../../../../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const getCourierFinancesProcedure = protectedProcedure
  .input(
    z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    let query = db
      .select({
        id: courierFinances.id,
        deliveryId: courierFinances.deliveryId,
        amount: courierFinances.amount,
        platformFee: courierFinances.platformFee,
        netAmount: courierFinances.netAmount,
        status: courierFinances.status,
        paidAt: courierFinances.paidAt,
        createdAt: courierFinances.createdAt,
        deliveryType: courierDeliveries.type,
      })
      .from(courierFinances)
      .leftJoin(courierDeliveries, eq(courierDeliveries.id, courierFinances.deliveryId))
      .where(eq(courierFinances.courierId, ctx.userId));

    if (input.startDate) {
      query = query.where(
        and(
          eq(courierFinances.courierId, ctx.userId),
          gte(courierFinances.createdAt, input.startDate)
        )
      ) as typeof query;
    }

    if (input.endDate) {
      query = query.where(
        and(
          eq(courierFinances.courierId, ctx.userId),
          lte(courierFinances.createdAt, input.endDate)
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

export default getCourierFinancesProcedure;
