import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { courierDeliveries, orders } from "../../../../../db/schema";
import { eq, or } from "drizzle-orm";

export const getCourierDeliveriesProcedure = protectedProcedure
  .input(
    z.object({
      status: z.enum(["assigned", "accepted", "picked_up", "in_transit", "delivered", "cancelled"]).optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    let whereCondition = eq(courierDeliveries.courierId, ctx.userId);

    if (input.status) {
      whereCondition = or(
        eq(courierDeliveries.courierId, ctx.userId),
        eq(courierDeliveries.status, input.status)
      ) as typeof whereCondition;
    }

    const deliveries = await db
      .select({
        id: courierDeliveries.id,
        orderId: courierDeliveries.orderId,
        type: courierDeliveries.type,
        status: courierDeliveries.status,
        pickupAddress: courierDeliveries.pickupAddress,
        deliveryAddress: courierDeliveries.deliveryAddress,
        pickupLatitude: courierDeliveries.pickupLatitude,
        pickupLongitude: courierDeliveries.pickupLongitude,
        deliveryLatitude: courierDeliveries.deliveryLatitude,
        deliveryLongitude: courierDeliveries.deliveryLongitude,
        estimatedTime: courierDeliveries.estimatedTime,
        actualPickupTime: courierDeliveries.actualPickupTime,
        actualDeliveryTime: courierDeliveries.actualDeliveryTime,
        price: courierDeliveries.price,
        createdAt: courierDeliveries.createdAt,
        orderCategory: orders.category,
        orderComment: orders.comment,
      })
      .from(courierDeliveries)
      .leftJoin(orders, eq(orders.id, courierDeliveries.orderId))
      .where(whereCondition);

    return deliveries;
  });

export default getCourierDeliveriesProcedure;
