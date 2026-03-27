import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { courierProfiles, users } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const getCourierProfileProcedure = publicProcedure
  .input(
    z.object({
      courierId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const [profile] = await db
      .select()
      .from(courierProfiles)
      .where(eq(courierProfiles.userId, input.courierId))
      .limit(1);

    if (!profile) {
      throw new Error("Courier profile not found");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, input.courierId))
      .limit(1);

    return {
      ...profile,
      user: {
        name: user.name,
        phone: user.phone,
        email: user.email,
        rating: user.rating,
        completedOrders: user.completedOrders,
      },
    };
  });

export default getCourierProfileProcedure;
