import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { orders, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const updateOrderStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    "new",
    "offers_received",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  chosenCleanerId: z.string().optional(),
});

export default publicProcedure
  .input(updateOrderStatusSchema)
  .mutation(async ({ input }) => {
    const updateData: any = {
      status: input.status,
    };

    if (input.chosenCleanerId) {
      updateData.chosenCleanerId = input.chosenCleanerId;
    }

    if (input.status === "completed") {
      updateData.completedAt = new Date().toISOString();

      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (order) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, order.userId),
        });

        if (user) {
          await db
            .update(users)
            .set({
              cleanPoints: user.cleanPoints + 50,
              completedOrders: user.completedOrders + 1,
            })
            .where(eq(users.id, user.id));
        }
      }
    }

    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, input.orderId))
      .returning();

    return {
      ...updatedOrder,
      photos: JSON.parse(updatedOrder.photos),
      aiAnalysis: updatedOrder.aiAnalysis
        ? JSON.parse(updatedOrder.aiAnalysis)
        : null,
      commission: updatedOrder.commission
        ? JSON.parse(updatedOrder.commission)
        : null,
    };
  });
