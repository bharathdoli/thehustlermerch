import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "../../shared/errors/api/AppError";

export async function deleteReviewUseCase(reviewId: string) {

  // TODO: ownership/admin check — same as update. Either the review's
  // author or an admin should be allowed to delete it.

  // Check review exists
  const review = await prisma.reviews.findUnique({
    where: {
      rid: reviewId,
    },
  });

  if (!review) {
    throw new AppError("Review not found.", 404);
  }

  await prisma.reviews.delete({
    where: {
      rid: reviewId,
    },
  });

  await recalculateProductRating(review.productId);

  return {
    message: "Review deleted successfully.",
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