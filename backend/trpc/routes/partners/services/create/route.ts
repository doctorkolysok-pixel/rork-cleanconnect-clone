import { z } from "zod";
import { protectedProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { partnerServices } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const createServiceProcedure = protectedProcedure
  .input(
    z.object({
      serviceName: z.string(),
      category: z.enum(["clothing", "furniture", "shoes", "carpets", "cleaning", "strollers"]),
      price: z.number(),
      description: z.string().optional(),
      estimatedTime: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const allServices = await db
      .select()
      .from(partnerServices)
      .where(eq(partnerServices.category, input.category));

    const avgPrice = allServices.length > 0
      ? allServices.reduce((sum, s) => sum + s.price, 0) / allServices.length
      : input.price;

    let priceQualityIndicator: "low" | "optimal" | "premium" = "optimal";
    if (input.price < avgPrice * 0.7) {
      priceQualityIndicator = "low";
    } else if (input.price > avgPrice * 1.3) {
      priceQualityIndicator = "premium";
    }

    await db.insert(partnerServices).values({
      id: serviceId,
      partnerId: ctx.userId,
      serviceName: input.serviceName,
      category: input.category,
      price: input.price,
      description: input.description,
      estimatedTime: input.estimatedTime,
      isActive: true,
      priceQualityIndicator,
      avgMarketPrice: avgPrice,
    });

    return {
      success: true,
      serviceId,
      priceQualityIndicator,
      avgMarketPrice: avgPrice,
    };
  });

export default createServiceProcedure;
