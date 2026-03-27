import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { courierDeliveries, orderHistory } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const acceptDeliveryProcedure = protectedProcedure
  .input(
    z.object({
      deliveryId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await db
      .update(courierDeliveries)
      .set({ status: "accepted" })
      .where(eq(courierDeliveries.id, input.deliveryId));

    const [delivery] = await db
      .select()
      .from(courierDeliveries)
      .where(eq(courierDeliveries.id, input.deliveryId))
      .limit(1);

    if (delivery) {
      const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(orderHistory).values({
        id: historyId,
        orderId: delivery.orderId,
        action: "Курьер принял заказ на доставку",
        performedBy: ctx.userId,
      });
    }

    return { success: true };
  });

export default acceptDeliveryProcedure;
