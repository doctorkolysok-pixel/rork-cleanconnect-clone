import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { courierProfiles, users } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const getAvailableCouriersProcedure = publicProcedure
  .input(
    z.object({
      city: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let whereCondition = and(
      eq(courierProfiles.isOnline, true),
      eq(courierProfiles.isVerified, true)
    );

    if (input.city) {
      whereCondition = and(
        eq(courierProfiles.isOnline, true),
        eq(courierProfiles.isVerified, true),
        eq(courierProfiles.city, input.city)
      ) as typeof whereCondition;
    }

    const couriers = await db
      .select({
        id: courierProfiles.id,
        userId: courierProfiles.userId,
        vehicleType: courierProfiles.vehicleType,
        city: courierProfiles.city,
        currentLatitude: courierProfiles.currentLatitude,
        currentLongitude: courierProfiles.currentLongitude,
        totalDeliveries: courierProfiles.totalDeliveries,
        userName: users.name,
        userRating: users.rating,
      })
      .from(courierProfiles)
      .leftJoin(users, eq(users.id, courierProfiles.userId))
      .where(whereCondition);

    return couriers;
  });

export default getAvailableCouriersProcedure;
