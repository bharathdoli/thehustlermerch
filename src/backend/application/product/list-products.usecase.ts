import { prisma } from "../../../lib/db/prisma";

export async function listProductUseCase() {

    const Product = await prisma.product.findMany({

        orderBy: {
            productName: "asc"
        }

    });

    return Product.map(product => ({
        categoryId: product.categoryId,
        productId: product.productId,
        productName: product.productName,
        description: product.description,
        imageUrl: product.productImage,
        rating:product.rating,
        reviewCount:product.reviewCount
    }));
}