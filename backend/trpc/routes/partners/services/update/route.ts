import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { partnerServices } from "../../../../../db/schema";
import { eq, and } from "drizzle-orm";

export const updateServiceProcedure = protectedProcedure
  .input(
    z.object({
      serviceId: z.string(),
      serviceName: z.string().optional(),
      price: z.number().optional(),
      description: z.string().optional(),
      estimatedTime: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const updateData: Record<string, unknown> = {};

    if (input.serviceName) updateData.serviceName = input.serviceName;
    if (input.price) {
      updateData.price = input.price;
      
      const [currentService] = await db
        .select()
        .from(partnerServices)
        .where(eq(partnerServices.id, input.serviceId))
        .limit(1);

      if (currentService) {
        const allServices = await db
          .select()
          .from(partnerServices)
          .where(eq(partnerServices.category, currentService.category));

        const avgPrice = allServices.length > 0
          ? allServices.reduce((sum, s) => sum + s.price, 0) / allServices.length
          : input.price;

        let priceQualityIndicator: "low" | "optimal" | "premium" = "optimal";
        if (input.price < avgPrice * 0.7) {
          priceQualityIndicator = "low";
        } else if (input.price > avgPrice * 1.3) {
          priceQualityIndicator = "premium";
        }

        updateData.priceQualityIndicator = priceQualityIndicator;
        updateData.avgMarketPrice = avgPrice;
      }
    }
    if (input.description !== undefined) updateData.description = input.description;
    if (input.estimatedTime) updateData.estimatedTime = input.estimatedTime;
    if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;

    updateData.updatedAt = new Date().toISOString();

    await db
      .update(partnerServices)
      .set(updateData)
      .where(
        and(
          eq(partnerServices.id, input.serviceId),
          eq(partnerServices.partnerId, ctx.userId)
        )
      );

    return { success: true };
  });

export default updateServiceProcedure;
