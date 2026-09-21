import { prisma } from "@/src/lib/db/prisma";
import {
  AddToCartInput,
  AddToCartSchema,
} from "@/src/schema/cart.schema";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireUser } from "../../shared/auth/session-validation";

export async function addToCartUseCase(input: AddToCartInput) {
  const currentUser = await requireUser();

  const data = AddToCartSchema.parse(input);

  return prisma.$transaction(
    async (tx) => {
      // 1. Find the variant
      const variant = await tx.productVariant.findUnique({
        where: {
          variantId: data.variantId,
        },
      });

      if (!variant) {
        throw new AppError(
          "Product variant not found.",
          404
        );
      }

      // 2. Find or create the user's cart
      const cart = await tx.cart.upsert({
        where: {
          userId: currentUser.id,
        },
        update: {},
        create: {
          userId: currentUser.id,
        },
      });

      // 3. Check whether this exact variant is already
      //    present in the cart.
      const existingItem = await tx.item.findFirst({
        where: {
          cartId: cart.cartId,
          variantId: data.variantId,
          customizationLogoFront:
            data.customizationLogoFront || null,
          customizationLogoBack:
            data.customizationLogoBack || null,
        },
      });

      // 4. Calculate the final quantity
      const requestedTotalQty =
        (existingItem?.quantity ?? 0) +
        data.quantity;

      // 5. Check stock
      if (
        requestedTotalQty >
        variant.stockQuantity
      ) {
        throw new AppError(
          `Only ${variant.stockQuantity} in stock — you already have ${
            existingItem?.quantity ?? 0
          } in your cart.`,
          400
        );
      }

      // 6. Existing item -> merge quantity
      if (existingItem) {
        return tx.item.update({
          where: {
            itemId: existingItem.itemId,
          },
          data: {
            quantity: requestedTotalQty,
          },
        });
      }

      // 7. New item
      return tx.item.create({
        data: {
          userId: currentUser.id,
          cartId: cart.cartId,
          variantId: data.variantId,
          quantity: data.quantity,
          unitPrice: variant.price,
          customizationLogoFront:
            data.customizationLogoFront || null,
          customizationLogoBack:
            data.customizationLogoBack || null,
        },
      });
    },
    {
      maxWait: 10000,
      timeout: 10000,
    }
  );
}