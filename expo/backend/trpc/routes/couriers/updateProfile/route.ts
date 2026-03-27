import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { courierProfiles } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const updateCourierProfileProcedure = protectedProcedure
  .input(
    z.object({
      vehicleType: z.enum(["bike", "scooter", "car", "van"]).optional(),
      city: z.string().optional(),
      isOnline: z.boolean().optional(),
      currentLatitude: z.number().optional(),
      currentLongitude: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updateData: Record<string, unknown> = {};

    if (input.vehicleType) updateData.vehicleType = input.vehicleType;
    if (input.city) updateData.city = input.city;
    if (input.isOnline !== undefined) updateData.isOnline = input.isOnline ? 1 : 0;
    if (input.currentLatitude !== undefined) updateData.currentLatitude = input.currentLatitude;
    if (input.currentLongitude !== undefined) updateData.currentLongitude = input.currentLongitude;

    await db
      .update(courierProfiles)
      .set(updateData)
      .where(eq(courierProfiles.userId, ctx.userId));

    return { success: true };
  });

export default updateCourierProfileProcedure;
