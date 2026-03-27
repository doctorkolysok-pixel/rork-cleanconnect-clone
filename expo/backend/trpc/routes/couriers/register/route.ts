import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { courierProfiles, users } from "../../../../db/schema";

export const registerCourierProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      vehicleType: z.enum(["bike", "scooter", "car", "van"]),
      city: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = `courier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(users).values({
      id: userId,
      role: "courier",
      name: input.name,
      phone: input.phone,
      email: input.email,
      rating: 5.0,
      balance: 0,
      cleanPoints: 50,
      level: 1,
      completedOrders: 0,
    });

    const profileId = `courier_profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(courierProfiles).values({
      id: profileId,
      userId,
      vehicleType: input.vehicleType,
      city: input.city,
      isOnline: false,
      isVerified: false,
      totalDeliveries: 0,
      totalEarnings: 0,
    });

    return {
      success: true,
      userId,
      profileId,
    };
  });

export default registerCourierProcedure;
