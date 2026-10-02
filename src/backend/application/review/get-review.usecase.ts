import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "../../shared/errors/api/AppError";

export async function getReviewUseCase(id: string) {
  const review = await prisma.reviews.findFirst({
    where: {
      rid: id,
    },
    include: {
      user: {
        select: {
          uname: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError("Review Not Found", 404);
  }

  return {
    rid: review.rid,
    productId: review.productId,
    userId: review.userId,
    orderId: review.orderId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    user: review.user,
  };
}