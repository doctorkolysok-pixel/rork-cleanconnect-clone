import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orders, orderHistory } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const updatePartnerOrderStatusProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
      status: z.enum([
        "at_partner",
        "partner_working",
        "partner_done",
      ]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    await db
      .update(orders)
      .set({ status: input.status })
      .where(eq(orders.id, input.orderId));

    const statusMessages: Record<string, string> = {
      at_partner: "Заказ получен партнёром",
      partner_working: "Партнёр работает над заказом",
      partner_done: "Работа выполнена, готов к передаче курьеру",
    };

    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(orderHistory).values({
      id: historyId,
      orderId: input.orderId,
      action: statusMessages[input.status] || "Статус обновлён",
      performedBy: ctx.userId,
    });

    return { success: true };
  });

export default updatePartnerOrderStatusProcedure;
