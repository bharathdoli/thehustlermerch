import { prisma } from "@/src/lib/db/prisma";
import { UpdateCartItemInput, UpdateCartItemSchema } from "@/src/schema/cart.schema";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireUser } from "../../shared/auth/session-validation";

export async function updateCartItemUseCase(
  itemId: string,
  input: UpdateCartItemInput
) {
  const currentUser = await requireUser();

  const data = UpdateCartItemSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { itemId },
      include: { variant: true },
    });

    if (!item || !item.cartId) {
      throw new AppError("Cart item not found.", 404);
    }

    if (item.userId !== currentUser.id) {
      throw new AppError("You are not allowed to modify this cart item.", 403);
    }

    if (data.quantity > item.variant.stockQuantity) {
      throw new AppError(
        `Only ${item.variant.stockQuantity} in stock.`,
        400
      );
    }

    return tx.item.update({
      where: { itemId },
      data: { quantity: data.quantity },
    });
  });
}