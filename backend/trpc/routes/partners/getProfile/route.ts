import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { partnerProfiles, users } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const getPartnerProfileProcedure = publicProcedure
  .input(
    z.object({
      partnerId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const [profile] = await db
      .select()
      .from(partnerProfiles)
      .where(eq(partnerProfiles.userId, input.partnerId))
      .limit(1);

    if (!profile) {
      throw new Error("Partner profile not found");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, input.partnerId))
      .limit(1);

    return {
      ...profile,
      services: JSON.parse(profile.services),
      user: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        rating: user.rating,
        completedOrders: user.completedOrders,
      },
    };
  });

export default getPartnerProfileProcedure;
