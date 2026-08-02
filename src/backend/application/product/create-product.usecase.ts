import { CreateProductInput, CreateProductSchema } from "@/src/schema/product.schema";
import { prisma } from "../../../lib/db/prisma";



import { requireAdmin } from "../../shared/auth/session-validation";

export async function createProductUseCase(
    input: CreateProductInput
) {

  
    await requireAdmin();

    const data = CreateProductSchema.parse(input);

    const exists = await prisma.product.findFirst({
        where: {
            productName: data.productName
        }
    });

    if (exists) {
        throw new Error("Product already exists.");
    }

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
}