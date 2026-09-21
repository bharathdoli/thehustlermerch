import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";
import { UpdateProductInput, UpdateProductSchema } from "@/src/schema/product.schema";
import { AppError } from "../../shared/errors/api/AppError";



export async function updateProductUseCase(
  ProductId: string,
  input: UpdateProductInput
) {

  // Authentication

  await requireAdmin();

  // Validation
  const data = UpdateProductSchema.parse(input);

  // Check Product exists
  const existingProduct = await prisma.product.findUnique({
    where: {
      productId:ProductId,
    },
  });

  if (!existingProduct) {
    throw new AppError("Product not found.",404);
  }

  // Prevent duplicate names
  if (data.productName) {
    const duplicate = await prisma.product.findFirst({
      where: {
        productName: data.productName,
        NOT: {
          productId:ProductId,
        },
      },
    });

    if (duplicate) {
      throw new AppError("Product name already exists.",409);
    }
  }

  // Update
  const Product = await prisma.product.update({
    where: {
      productId:ProductId,
    },
    data,
  });

  return {
    ProductId: Product.productId,
    ProductName: Product.productName,
    description: Product.description,
    productImage: Product.productImage,
    rating:Product.rating,
    reviewCount:Product.reviewCount
  };
}