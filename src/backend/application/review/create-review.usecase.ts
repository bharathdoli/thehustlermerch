import { CreateReviewInput, CreateReviewSchema } from "@/src/schema/reviews.schema";
import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "../../shared/errors/api/AppError";

export async function createReviewUseCase(
  productId: string,
  input: CreateReviewInput
) {

  // Validation
  const data = CreateReviewSchema.parse({ ...input, productId });

  // Check product exists
  const product = await prisma.product.findUnique({
    where: {
      productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  // Prevent duplicate review by same user on same product
  if (data.userId) {
    const existing = await prisma.reviews.findFirst({
      where: {
        productId,
        userId: data.userId,
      },
    });

    if (existing) {
      throw new AppError("You have already reviewed this product.", 409);
    }
  }

  const review = await prisma.reviews.create({
    data: {
      productId,
      userId: data.userId,
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  // Recalculate product aggregate rating + reviewCount
  await recalculateProductRating(productId);

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