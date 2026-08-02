import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";

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
    throw new Error("Product not found.");
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