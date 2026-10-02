import { prisma } from "@/src/lib/db/prisma";

export async function listReviewsUseCase(
  productId: string,
  { page = 1, limit = 10 }: { page?: number; limit?: number } = {}
) {

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.reviews.findMany({
      where: {
        productId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            uname: true,
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.reviews.count({
      where: { productId },
    }),
  ]);

  return {
    data: reviews.map((review) => ({
      rid: review.rid,
      productId: review.productId,
      userId: review.userId,
      orderId: review.orderId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: review.user,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}