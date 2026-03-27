import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { messages } from "@/backend/db/schema";
import { eq, desc } from "drizzle-orm";

const getOrderMessagesSchema = z.object({
  orderId: z.string(),
});

export default publicProcedure
  .input(getOrderMessagesSchema)
  .query(async ({ input }) => {
    const orderMessages = await db.query.messages.findMany({
      where: eq(messages.orderId, input.orderId),
      orderBy: [desc(messages.createdAt)],
    });

    return orderMessages;
  });
