import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../db";
import { partnerProfiles } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const updatePartnerProfileProcedure = protectedProcedure
  .input(
    z.object({
      businessName: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      description: z.string().optional(),
      services: z.array(z.string()).optional(),
      workingHours: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updateData: Record<string, unknown> = {};

    if (input.businessName) updateData.businessName = input.businessName;
    if (input.address) updateData.address = input.address;
    if (input.city) updateData.city = input.city;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.services) updateData.services = JSON.stringify(input.services);
    if (input.workingHours !== undefined) updateData.workingHours = input.workingHours;
    if (input.latitude !== undefined) updateData.latitude = input.latitude;
    if (input.longitude !== undefined) updateData.longitude = input.longitude;
    if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;

    await db
      .update(partnerProfiles)
      .set(updateData)
      .where(eq(partnerProfiles.userId, ctx.userId));

    return { success: true };
  });

export default updatePartnerProfileProcedure;
