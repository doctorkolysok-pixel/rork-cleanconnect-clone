import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  role: z.enum(["client", "cleaner", "courier"]),
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  businessName: z.string().optional(),
  address: z.string().optional(),
});

export default publicProcedure
  .input(registerSchema)
  .mutation(async ({ input }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.phone, input.phone),
    });

    if (existingUser) {
      throw new Error("Пользователь с таким номером уже существует");
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        role: input.role,
        name: input.name,
        phone: input.phone,
        email: input.email,
      })
      .returning();

    return user;
  });
