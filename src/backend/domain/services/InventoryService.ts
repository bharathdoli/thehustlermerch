import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "@/src/backend/shared/errors/api/AppError";

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function decrementStock(
  tx: TxClient,
  items: { variantId: string; quantity: number }[]
) {
  for (const item of items) {
    const result = await tx.productVariant.updateMany({
      where: {
        variantId: item.variantId,
        stockQuantity: { gte: item.quantity }, // atomic guard, not a separate read
      },
      data: { stockQuantity: { decrement: item.quantity } },
    });

    if (result.count === 0) {
      throw new AppError(
        "One or more items went out of stock while placing your order. Please review your cart.",
        400
      );
    }
  }
}

export async function restockItems(
  tx: TxClient,
  items: { variantId: string; quantity: number }[]
) {
  for (const item of items) {
    await tx.productVariant.update({
      where: { variantId: item.variantId },
      data: { stockQuantity: { increment: item.quantity } },
    });
  }
}