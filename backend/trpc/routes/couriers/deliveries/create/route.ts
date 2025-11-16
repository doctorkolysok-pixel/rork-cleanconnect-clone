import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { courierDeliveries, orders, orderHistory } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const createDeliveryProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
      courierId: z.string(),
      type: z.enum(["to_partner", "to_client"]),
      pickupAddress: z.string(),
      deliveryAddress: z.string(),
      pickupLatitude: z.number().optional(),
      pickupLongitude: z.number().optional(),
      deliveryLatitude: z.number().optional(),
      deliveryLongitude: z.number().optional(),
      estimatedTime: z.string().optional(),
      price: z.number(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const deliveryId = `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(courierDeliveries).values({
      id: deliveryId,
      orderId: input.orderId,
      courierId: input.courierId,
      type: input.type,
      status: "assigned",
      pickupAddress: input.pickupAddress,
      deliveryAddress: input.deliveryAddress,
      pickupLatitude: input.pickupLatitude,
      pickupLongitude: input.pickupLongitude,
      deliveryLatitude: input.deliveryLatitude,
      deliveryLongitude: input.deliveryLongitude,
      estimatedTime: input.estimatedTime,
      price: input.price,
    });

    const orderStatus = input.type === "to_partner" ? "courier_to_partner" : "courier_to_client";
    await db
      .update(orders)
      .set({ status: orderStatus, courierId: input.courierId })
      .where(eq(orders.id, input.orderId));

    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(orderHistory).values({
      id: historyId,
      orderId: input.orderId,
      action: `Назначен курьер для доставки ${input.type === "to_partner" ? "партнёру" : "клиенту"}`,
      performedBy: ctx.userId,
    });

    return { success: true, deliveryId };
  });

export default createDeliveryProcedure;
