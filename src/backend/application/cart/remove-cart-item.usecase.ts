import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireUser } from "../../shared/auth/session-validation";

export async function removeCartItemUseCase(itemId: string) {
  const currentUser = await requireUser();

  const item = await prisma.item.findUnique({ where: { itemId } });

  if (!item || !item.cartId) {
    throw new AppError("Cart item not found.", 404);
  }

  if (item.userId !== currentUser.id) {
    throw new AppError("You are not allowed to remove this cart item.", 403);
  }

  await prisma.item.delete({ where: { itemId } });

  return { success: true };
}