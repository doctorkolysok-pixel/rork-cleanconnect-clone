import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { orders } from "@/backend/db/schema";
import { eq, desc } from "drizzle-orm";

export default publicProcedure.query(async () => {
  const availableOrders = await db.query.orders.findMany({
    where: eq(orders.status, "new"),
    orderBy: [desc(orders.createdAt)],
  });

  return availableOrders.map((order) => ({
    ...order,
    photos: JSON.parse(order.photos),
    aiAnalysis: order.aiAnalysis ? JSON.parse(order.aiAnalysis) : null,
    commission: order.commission ? JSON.parse(order.commission) : null,
  }));
});
