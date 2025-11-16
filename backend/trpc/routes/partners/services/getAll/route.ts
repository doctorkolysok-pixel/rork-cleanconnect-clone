import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { partnerServices } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const getAllServicesProcedure = protectedProcedure
  .input(
    z.object({
      partnerId: z.string().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    const partnerId = input.partnerId || ctx.userId;

    const services = await db
      .select()
      .from(partnerServices)
      .where(eq(partnerServices.partnerId, partnerId));

    return services;
  });

export default getAllServicesProcedure;
