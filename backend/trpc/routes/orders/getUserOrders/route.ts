import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { orders } from "@/backend/db/schema";
import { eq, desc } from "drizzle-orm";

const getUserOrdersSchema = z.object({
  userId: z.string(),
});

export default publicProcedure
  .input(getUserOrdersSchema)
  .query(async ({ input }) => {
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, input.userId),
      orderBy: [desc(orders.createdAt)],
    });

    return userOrders.map((order) => ({
      ...order,
      photos: JSON.parse(order.photos),
      aiAnalysis: order.aiAnalysis ? JSON.parse(order.aiAnalysis) : null,
      commission: order.commission ? JSON.parse(order.commission) : null,
    }));
  });
