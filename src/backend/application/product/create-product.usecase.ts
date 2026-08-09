import { CreateProductInput, CreateProductSchema } from "@/src/schema/product.schema";
import { prisma } from "../../../lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";
import { Prisma } from "@/src/generated/prisma/client";
import { AppError } from "../../shared/errors/api/AppError";

export async function createProductUseCase(
    input: CreateProductInput
) {

  
    await requireAdmin();

    const data = CreateProductSchema.parse(input);

  const existing = await prisma.product.findFirst({
    where: {
      categoryId: data.categoryId ?? null,
      productName: data.productName,
    },
  });

  if (existing) {
    throw new AppError("A product with this name already exists in this category.",409);
  }

   try {
     const product = await prisma.product.create({
         data: {
             productName: data.productName,
             description: data.description,
             productImage: data.productImage,
             categoryId:data.categoryId,
             rating:data.rating,
             reviewCount:data.reviewCount
         }
     });
 
     return {
         productId: product.productId,
         productName: product.productName,
         description: product.description,
         imageUrl: product.productImage,
         rating: product.rating,
         reviewCount: product.reviewCount
     };
   } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("A product with this name already exists in this category.",409);
    }
    throw error;
   }
}