import { prisma } from "@/src/lib/db/prisma";
import {
  CreateProductVariantInput,
  CreateProductVariantSchema,
} from "@/src/schema/product-variant.schema";
import { requireAdmin } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function createVariantUseCase(
  productId: string,
  input: CreateProductVariantInput
) {
  // Authentication
  await requireAdmin();

  // Validation
  const data = CreateProductVariantSchema.parse(input);

  // Check parent product exists
  const product = await prisma.product.findUnique({
    where: { productId },
  });

  if (!product) {
    throw new AppError("Product not found.",404);
  }

  // Prevent duplicate colour/size combo on the same product
  const duplicate = await prisma.productVariant.findFirst({
    where: {
      productId,
      colour: data.colour ?? null,
      size: data.size ?? null,
    },
  });

  if (duplicate) {
    throw new AppError(
      "A variant with this colour and size already exists for this product.",409
    );
  }

  const variant = await prisma.productVariant.create({
    data: {
      productId,
      colour: data.colour,
      size: data.size,
      price: data.price,
      stockQuantity: data.stockQuantity ?? 0,
    },
  });

  return variant;
}