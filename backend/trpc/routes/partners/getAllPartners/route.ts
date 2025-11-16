import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { partnerProfiles, users } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const getAllPartnersProcedure = publicProcedure
  .input(
    z.object({
      city: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let query = db
      .select({
        id: partnerProfiles.id,
        userId: partnerProfiles.userId,
        businessName: partnerProfiles.businessName,
        address: partnerProfiles.address,
        city: partnerProfiles.city,
        description: partnerProfiles.description,
        services: partnerProfiles.services,
        workingHours: partnerProfiles.workingHours,
        isVerified: partnerProfiles.isVerified,
        visibilityRating: partnerProfiles.visibilityRating,
        latitude: partnerProfiles.latitude,
        longitude: partnerProfiles.longitude,
        createdAt: partnerProfiles.createdAt,
        userName: users.name,
        userRating: users.rating,
        userCompletedOrders: users.completedOrders,
      })
      .from(partnerProfiles)
      .leftJoin(users, eq(users.id, partnerProfiles.userId))
      .where(eq(partnerProfiles.isActive, true));

    if (input.city) {
      query = query.where(
        and(
          eq(partnerProfiles.isActive, true),
          eq(partnerProfiles.city, input.city)
        )
      ) as typeof query;
    }

    const partners = await query;

    return partners.map((partner) => ({
      ...partner,
      services: JSON.parse(partner.services),
    }));
  });

export default getAllPartnersProcedure;
