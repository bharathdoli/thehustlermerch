import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function deleteProductUseCase(ProductId: string) {

  // Authentication
  await requireAdmin();

  // Check Product exists
  const Product = await prisma.product.findUnique({
    where: {
      productId:ProductId,
    },
  });

  if (!Product) {
    throw new AppError("Product not found.",404);
  }

  // Delete
  await prisma.product.delete({
    where: {
      productId:ProductId,
    },
  });

  return {
    message: "Product deleted successfully.",
  };
}