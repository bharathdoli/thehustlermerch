import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "../../shared/errors/api/AppError";

export async function getProductUseCase(id: string) {
  const Product = await prisma.product.findFirst({
    where: {
      productId: id,
    },
    include: {
      variants: true,
    },
  });

  if (!Product) {
    throw new AppError("Product Not Found", 404);
  }

  return {
    CategoryId: Product.categoryId,
    ProductId: Product.productId,
    ProductName: Product.productName,
    ProductDescription: Product.description,
    ProductImage: Product.productImage,
    rating: Product.rating,
    reviewCount: Product.reviewCount,
    variants: Product.variants,
  };
}