import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { offers, orders } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const createOfferSchema = z.object({
  orderId: z.string(),
  cleanerId: z.string(),
  proposedPrice: z.number(),
  comment: z.string(),
  eta: z.string(),
});

export default publicProcedure
  .input(createOfferSchema)
  .mutation(async ({ input }) => {
    const offerId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [offer] = await db
      .insert(offers)
      .values({
        id: offerId,
        orderId: input.orderId,
        cleanerId: input.cleanerId,
        proposedPrice: input.proposedPrice,
        comment: input.comment,
        eta: input.eta,
      })
      .returning();

    await db
      .update(orders)
      .set({ status: "offers_received" })
      .where(eq(orders.id, input.orderId));

    return offer;
  });
