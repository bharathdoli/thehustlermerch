import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "../../shared/errors/api/AppError";

export async function getVariantUseCase(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { variantId },
  });

  if (!variant) {
    throw new AppError("Product variant not found.",404);
  }

  return variant;
}