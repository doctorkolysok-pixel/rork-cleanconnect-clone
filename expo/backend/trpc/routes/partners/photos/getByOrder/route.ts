import { z } from "zod";
import { publicProcedure } from "../../../../create-context";
import { db } from "../../../../../db";
import { orderPhotos } from "../../../../../db/schema";
import { eq } from "drizzle-orm";

export const getOrderPhotosProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const photos = await db
      .select()
      .from(orderPhotos)
      .where(eq(orderPhotos.orderId, input.orderId));

    return photos;
  });

export default getOrderPhotosProcedure;
