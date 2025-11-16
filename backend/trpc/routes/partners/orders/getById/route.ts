import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orders, users, courierDeliveries } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const getPartnerOrderByIdProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const orderResult = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        category: orders.category,
        photos: orders.photos,
        comment: orders.comment,
        address: orders.address,
        priceOffer: orders.priceOffer,
        urgency: orders.urgency,
        status: orders.status,
        courierId: orders.courierId,
        createdAt: orders.createdAt,
        completedAt: orders.completedAt,
        userName: users.name,
        userPhone: users.phone,
      })
      .from(orders)
      .leftJoin(users, eq(users.id, orders.userId))
      .where(eq(orders.id, input.orderId))
      .limit(1);

    if (!orderResult || orderResult.length === 0) {
      throw new Error("Заказ не найден");
    }

    const order = orderResult[0];

    let courierInfo = null;
    if (order.courierId) {
      const courierResult = await db
        .select({
          courierName: users.name,
          courierPhone: users.phone,
        })
        .from(users)
        .where(eq(users.id, order.courierId))
        .limit(1);

      if (courierResult && courierResult.length > 0) {
        courierInfo = courierResult[0];
      }

      const deliveryResult = await db
        .select({
          id: courierDeliveries.id,
        })
        .from(courierDeliveries)
        .where(eq(courierDeliveries.orderId, input.orderId))
        .limit(1);

      if (deliveryResult && deliveryResult.length > 0) {
        courierInfo = {
          ...courierInfo,
          deliveryId: deliveryResult[0].id,
        };
      }
    }

    return {
      ...order,
      photos: JSON.parse(order.photos),
      ...courierInfo,
    };
  });

export default getPartnerOrderByIdProcedure;
