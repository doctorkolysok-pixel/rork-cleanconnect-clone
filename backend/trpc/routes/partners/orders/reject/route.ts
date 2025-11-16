import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orderHistory } from "../../../../../db/schema";

export const rejectOrderProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
      reason: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(orderHistory).values({
      id: historyId,
      orderId: input.orderId,
      action: "Заказ отклонён партнёром",
      performedBy: ctx.userId,
      details: JSON.stringify({ reason: input.reason }),
    });

    return { success: true };
  });

export default rejectOrderProcedure;
