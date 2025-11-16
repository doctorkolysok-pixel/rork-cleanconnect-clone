import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const loginSchema = z.object({
  phone: z.string().min(10),
});

export default publicProcedure.input(loginSchema).mutation(async ({ input }) => {
  const user = await db.query.users.findFirst({
    where: eq(users.phone, input.phone),
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  return user;
});
