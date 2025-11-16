import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orders, users } from "../../../../../db/schema";
import { eq, or } from "drizzle-orm";

export const getPartnerOrdersProcedure = protectedProcedure.query(async ({ ctx }) => {
  const partnerOrders = await db
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
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      userName: users.name,
      userPhone: users.phone,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .where(
      or(
        eq(orders.partnerId, ctx.userId),
        eq(orders.status, "new"),
        eq(orders.status, "offers_received")
      )
    );

  return partnerOrders.map((order) => ({
    ...order,
    photos: JSON.parse(order.photos),
  }));
});

export default getPartnerOrdersProcedure;
