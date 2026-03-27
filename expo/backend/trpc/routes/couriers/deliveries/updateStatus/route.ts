import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { courierDeliveries, orderHistory, orders } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const updateDeliveryStatusProcedure = protectedProcedure
  .input(
    z.object({
      deliveryId: z.string(),
      status: z.enum(["picked_up", "in_transit", "delivered"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updateData: Record<string, unknown> = { status: input.status };

    if (input.status === "picked_up") {
      updateData.actualPickupTime = new Date().toISOString();
    } else if (input.status === "delivered") {
      updateData.actualDeliveryTime = new Date().toISOString();
    }

    await db
      .update(courierDeliveries)
      .set(updateData)
      .where(eq(courierDeliveries.id, input.deliveryId));

    const [delivery] = await db
      .select()
      .from(courierDeliveries)
      .where(eq(courierDeliveries.id, input.deliveryId))
      .limit(1);

    if (delivery) {
      const statusMessages: Record<string, string> = {
        picked_up: "Курьер забрал заказ",
        in_transit: "Заказ в пути",
        delivered: "Заказ доставлен",
      };

      const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(orderHistory).values({
        id: historyId,
        orderId: delivery.orderId,
        action: statusMessages[input.status],
        performedBy: ctx.userId,
      });

      if (input.status === "delivered" && delivery.type === "to_client") {
        await db
          .update(orders)
          .set({ status: "completed", completedAt: new Date().toISOString() })
          .where(eq(orders.id, delivery.orderId));
      } else if (input.status === "delivered" && delivery.type === "to_partner") {
        await db
          .update(orders)
          .set({ status: "at_partner" })
          .where(eq(orders.id, delivery.orderId));
      }
    }

    return { success: true };
  });

export default updateDeliveryStatusProcedure;
