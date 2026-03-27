import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const getUserSchema = z.object({
  userId: z.string(),
});

export default publicProcedure.input(getUserSchema).query(async ({ input }) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, input.userId),
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  return user;
});
