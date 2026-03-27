import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orders, orderHistory } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const acceptOrderProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await db
      .update(orders)
      .set({
        partnerId: ctx.userId,
        status: "at_partner",
      })
      .where(eq(orders.id, input.orderId));

    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(orderHistory).values({
      id: historyId,
      orderId: input.orderId,
      action: "Заказ принят партнёром",
      performedBy: ctx.userId,
    });

    return { success: true };
  });

export default acceptOrderProcedure;
