import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { messages } from "@/backend/db/schema";

const sendMessageSchema = z.object({
  orderId: z.string(),
  fromId: z.string(),
  toId: z.string(),
  message: z.string(),
});

export default publicProcedure
  .input(sendMessageSchema)
  .mutation(async ({ input }) => {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [message] = await db
      .insert(messages)
      .values({
        id: messageId,
        orderId: input.orderId,
        fromId: input.fromId,
        toId: input.toId,
        message: input.message,
      })
      .returning();

    return message;
  });
