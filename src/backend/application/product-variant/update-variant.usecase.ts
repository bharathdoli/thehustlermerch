import { prisma } from "@/src/lib/db/prisma";
import {
  UpdateProductVariantInput,
  UpdateProductVariantSchema,
} from "@/src/schema/product-variant.schema";
import { requireAdmin } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function updateVariantUseCase(
  variantId: string,
  input: UpdateProductVariantInput
) {
  // Authentication
  await requireAdmin();

  // Validation
  const data = UpdateProductVariantSchema.parse(input);

  // Check variant exists
  const existingVariant = await prisma.productVariant.findUnique({
    where: { variantId },
  });

  if (!existingVariant) {
    throw new AppError("Product variant not found.",404);
  }

  // Prevent duplicate colour/size combo within the same product
  if (data.colour !== undefined || data.size !== undefined) {
    const duplicate = await prisma.productVariant.findFirst({
      where: {
        productId: existingVariant.productId,
        colour: data.colour ?? existingVariant.colour,
        size: data.size ?? existingVariant.size,
        NOT: { variantId },
      },
    });

    if (duplicate) {
      throw new AppError(
        "A variant with this colour and size already exists for this product.",409
      );
    }
  }

  // Update
  const variant = await prisma.productVariant.update({
    where: { variantId },
    data,
  });

  return variant;
}