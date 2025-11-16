import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { offers, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const getOrderOffersSchema = z.object({
  orderId: z.string(),
});

export default publicProcedure
  .input(getOrderOffersSchema)
  .query(async ({ input }) => {
    const orderOffers = await db.query.offers.findMany({
      where: eq(offers.orderId, input.orderId),
      with: {
        cleaner: true,
      },
    });

    const enrichedOffers = await Promise.all(
      orderOffers.map(async (offer) => {
        const cleaner = await db.query.users.findFirst({
          where: eq(users.id, offer.cleanerId),
        });

        return {
          ...offer,
          cleanerName: cleaner?.name || "Unknown",
          cleanerRating: cleaner?.rating || 5.0,
        };
      })
    );

    return enrichedOffers;
  });
