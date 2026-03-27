import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { orders } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const getOrderSchema = z.object({
  orderId: z.string(),
});

export default publicProcedure.input(getOrderSchema).query(async ({ input }) => {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, input.orderId),
  });

  if (!order) {
    throw new Error("Заказ не найден");
  }

  return {
    ...order,
    photos: JSON.parse(order.photos),
    aiAnalysis: order.aiAnalysis ? JSON.parse(order.aiAnalysis) : null,
    commission: order.commission ? JSON.parse(order.commission) : null,
  };
});
