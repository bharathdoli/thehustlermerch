import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function deleteVariantUseCase(variantId: string) {
  // Authentication
  await requireAdmin();

  // Check variant exists
  const existingVariant = await prisma.productVariant.findUnique({
    where: { variantId },
  });

  if (!existingVariant) {
    throw new AppError("Product variant not found.",404);
  }

  // A variant that's already been ordered can't be hard-deleted —
  // it would corrupt past order/cart line items pointing at it.
  const referencedByItem = await prisma.item.findFirst({
    where: { variantId },
  });

  if (referencedByItem) {
    throw new AppError(
      "This variant has been ordered before and cannot be deleted. Set its stock to 0 instead.",409
    );
  }

  await prisma.productVariant.delete({
    where: { variantId },
  });

  return { success: true };
}