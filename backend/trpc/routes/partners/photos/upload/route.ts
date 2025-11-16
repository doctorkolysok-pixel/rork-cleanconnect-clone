import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orderPhotos, orderHistory } from "../../../../../db/schema";

export const uploadOrderPhotoProcedure = protectedProcedure
  .input(
    z.object({
      orderId: z.string(),
      type: z.enum(["before", "after"]),
      photoUrl: z.string(),
      comment: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(orderPhotos).values({
      id: photoId,
      orderId: input.orderId,
      partnerId: ctx.userId,
      type: input.type,
      photoUrl: input.photoUrl,
      comment: input.comment,
    });

    const historyId = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(orderHistory).values({
      id: historyId,
      orderId: input.orderId,
      action: `Загружено фото ${input.type === "before" ? "до работы" : "после работы"}`,
      performedBy: ctx.userId,
      details: input.comment ? JSON.stringify({ comment: input.comment }) : undefined,
    });

    return { success: true, photoId };
  });

export default uploadOrderPhotoProcedure;
