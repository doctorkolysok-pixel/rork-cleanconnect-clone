import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { partnerProfiles, users } from "../../../../db/schema";

export const registerPartnerProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      businessName: z.string(),
      address: z.string(),
      city: z.string(),
      description: z.string().optional(),
      services: z.array(z.string()),
      workingHours: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(users).values({
      id: userId,
      role: "partner",
      name: input.name,
      phone: input.phone,
      email: input.email,
      rating: 5.0,
      balance: 0,
      cleanPoints: 50,
      level: 1,
      completedOrders: 0,
    });

    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(partnerProfiles).values({
      id: profileId,
      userId,
      businessName: input.businessName,
      address: input.address,
      city: input.city,
      description: input.description,
      services: JSON.stringify(input.services),
      workingHours: input.workingHours,
      isVerified: false,
      isActive: true,
      visibilityRating: 100,
      totalEarnings: 0,
      latitude: input.latitude,
      longitude: input.longitude,
    });

    return {
      success: true,
      userId,
      profileId,
    };
  });

export default registerPartnerProcedure;
