import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";
import { UpdateProductInput, UpdateProductSchema } from "@/src/schema/product.schema";



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
    throw new Error("Product not found.");
  }

  // Prevent duplicate names
  if (data.productName) {
    const duplicate = await prisma.product.findFirst({
      where: {
        ProductName: data.productName,
        NOT: {
          productId:ProductId,
        },
      },
    });

    if (duplicate) {
      throw new Error("Product name already exists.");
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
    imageUrl: Product.productImage,
     rating:Product.rating,
    reviewCount:Product.reviewCount
  };
}