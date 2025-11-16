import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { orders, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const createOrderSchema = z.object({
  userId: z.string(),
  category: z.enum(["clothing", "furniture", "shoes", "carpets", "cleaning", "strollers"]),
  photos: z.array(z.string()),
  comment: z.string(),
  address: z.string(),
  priceOffer: z.number(),
  urgency: z.enum(["standard", "fast", "urgent", "express"]).default("standard"),
  aiAnalysis: z.any().optional(),
  commission: z.any().optional(),
});

export const createOrderProcedure = publicProcedure
  .input(createOrderSchema)
  .mutation(async ({ input }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, input.userId),
    });

    if (!existingUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пользователь не найден. Выполните вход и попробуйте снова.",
      });
    }

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const [order] = await db
        .insert(orders)
        .values({
          id: orderId,
          userId: input.userId,
          category: input.category,
          photos: JSON.stringify(input.photos),
          comment: input.comment,
          address: input.address,
          priceOffer: input.priceOffer,
          urgency: input.urgency,
          aiAnalysis: input.aiAnalysis ? JSON.stringify(input.aiAnalysis) : null,
          commission: input.commission ? JSON.stringify(input.commission) : null,
        })
        .returning();

      await db
        .update(users)
        .set({
          cleanPoints: (existingUser.cleanPoints || 0) + 10,
        })
        .where(eq(users.id, input.userId));

      return {
        ...order,
        photos: JSON.parse(order.photos),
        aiAnalysis: order.aiAnalysis ? JSON.parse(order.aiAnalysis) : null,
        commission: order.commission ? JSON.parse(order.commission) : null,
      };
    } catch (error) {
      console.error("Failed to create order", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось создать заказ. Попробуйте позже.",
      });
    }
  });

export default createOrderProcedure;
