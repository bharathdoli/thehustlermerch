import { prisma } from "@/src/lib/db/prisma";
import { UpdateReviewInput, UpdateReviewSchema } from "@/src/schema/reviews.schema";
import { AppError } from "../../shared/errors/api/AppError";

export async function updateReviewUseCase(
  reviewId: string,
  input: UpdateReviewInput
) {

  // Validation
  const data = UpdateReviewSchema.parse(input);

  // Check review exists
  const existingReview = await prisma.reviews.findUnique({
    where: {
      rid: reviewId,
    },
  });

  if (!existingReview) {
    throw new AppError("Review not found.", 404);
  }

  // TODO: ownership check — only the review's author (or an admin) should
  // be able to update it. Add once you tell me your session helper, e.g.:
  // const user = await requireUser();
  // if (user.id !== existingReview.userId) throw new AppError("Forbidden.", 403);

  const review = await prisma.reviews.update({
    where: {
      rid: reviewId,
    },
    data,
  });

  if (data.rating !== undefined) {
    await recalculateProductRating(existingReview.productId);
  }

  return {
    rid: review.rid,
    productId: review.productId,
    userId: review.userId,
    orderId: review.orderId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

async function recalculateProductRating(productId: string) {
  const agg = await prisma.reviews.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rid: true },
  });

  await prisma.product.update({
    where: { productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rid,
    },
  });
}