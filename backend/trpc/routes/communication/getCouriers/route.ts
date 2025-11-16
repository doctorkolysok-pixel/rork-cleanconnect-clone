import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { users, courierProfiles } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const getCouriersProcedure = publicProcedure.query(async () => {
  console.log("[getCouriers] Fetching all couriers");

  const couriers = await db
    .select({
      id: users.id,
      name: users.name,
      phone: users.phone,
      email: users.email,
      rating: users.rating,
      vehicleType: courierProfiles.vehicleType,
      city: courierProfiles.city,
      isOnline: courierProfiles.isOnline,
      isVerified: courierProfiles.isVerified,
      totalDeliveries: courierProfiles.totalDeliveries,
    })
    .from(users)
    .innerJoin(courierProfiles, eq(users.id, courierProfiles.userId))
    .where(eq(users.role, "courier"));

  console.log("[getCouriers] Found couriers:", couriers.length);

  return couriers;
});
