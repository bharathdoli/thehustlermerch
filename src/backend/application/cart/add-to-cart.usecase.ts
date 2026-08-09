import { prisma } from "@/src/lib/db/prisma";
import { AddToCartInput, AddToCartSchema } from "@/src/schema/cart.schema";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireUser } from "../../shared/auth/session-validation";

export async function addToCartUseCase(input: AddToCartInput) {
  const currentUser = await requireUser();

  const data = AddToCartSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { variantId: data.variantId },
    });

    if (!variant) {
      throw new AppError("Product variant not found.", 404);
    }

    const cart = await tx.cart.upsert({
      where: { userId: currentUser.id },
      update: {},
      create: { userId: currentUser.id },
    });

    // Same variant + same customization already in cart -> bump quantity
    // instead of a duplicate row.
    const existingItem = await tx.item.findFirst({
      where: {
        cartId: cart.cartId,
        variantId: data.variantId,
        customizationLogoFront: data.customizationLogoFront || null,
        customizationLogoBack: data.customizationLogoBack || null,
      },
    });

    const requestedTotalQty = (existingItem?.quantity ?? 0) + data.quantity;

    if (requestedTotalQty > variant.stockQuantity) {
      throw new AppError(
        `Only ${variant.stockQuantity} in stock — you already have ${existingItem?.quantity ?? 0} in your cart.`,
        400
      );
    }

    if (existingItem) {
      return tx.item.update({
        where: { itemId: existingItem.itemId },
        data: { quantity: requestedTotalQty },
      });
    }

    return tx.item.create({
      data: {
        userId: currentUser.id,
        cartId: cart.cartId,
        variantId: data.variantId,
        quantity: data.quantity,
        unitPrice: variant.price, // frozen at time of adding
        customizationLogoFront: data.customizationLogoFront || null,
        customizationLogoBack: data.customizationLogoBack || null,
      },
    });
  });
}