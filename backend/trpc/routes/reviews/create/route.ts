import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db";
import { reviews, users } from "@/backend/db/schema";
import { eq } from "drizzle-orm";

const createReviewSchema = z.object({
  orderId: z.string(),
  userId: z.string(),
  cleanerId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  photos: z.array(z.string()).optional(),
});

export default publicProcedure
  .input(createReviewSchema)
  .mutation(async ({ input }) => {
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [review] = await db
      .insert(reviews)
      .values({
        id: reviewId,
        orderId: input.orderId,
        userId: input.userId,
        cleanerId: input.cleanerId,
        rating: input.rating,
        comment: input.comment,
        photos: input.photos ? JSON.stringify(input.photos) : null,
      })
      .returning();

    const user = await db.query.users.findFirst({
      where: eq(users.id, input.userId),
    });

    if (user) {
      await db
        .update(users)
        .set({
          cleanPoints: user.cleanPoints + 20,
        })
        .where(eq(users.id, user.id));
    }

    const cleanerReviews = await db.query.reviews.findMany({
      where: eq(reviews.cleanerId, input.cleanerId),
    });

    const avgRating =
      cleanerReviews.reduce((acc, r) => acc + r.rating, 0) /
      cleanerReviews.length;

    await db
      .update(users)
      .set({ rating: avgRating })
      .where(eq(users.id, input.cleanerId));

    return {
      ...review,
      photos: review.photos ? JSON.parse(review.photos) : null,
    };
  });
