import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "../../../db";
import { orderHistory, users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const getOrderHistoryProcedure = publicProcedure
  .input(
    z.object({
      orderId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const history = await db
      .select({
        id: orderHistory.id,
        orderId: orderHistory.orderId,
        action: orderHistory.action,
        performedBy: orderHistory.performedBy,
        details: orderHistory.details,
        createdAt: orderHistory.createdAt,
        performedByName: users.name,
        performedByRole: users.role,
      })
      .from(orderHistory)
      .leftJoin(users, eq(users.id, orderHistory.performedBy))
      .where(eq(orderHistory.orderId, input.orderId))
      .orderBy(orderHistory.createdAt);

    return history.map((item) => ({
      ...item,
      details: item.details ? JSON.parse(item.details) : undefined,
    }));
  });

export default getOrderHistoryProcedure;
