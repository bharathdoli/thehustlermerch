import { prisma } from "@/src/lib/db/prisma";


export async function getProductUseCase(id: string){

    const Product = await prisma.product.findFirst({
        where:{
            productId:id
        }
    })

    if(!Product){
        throw new Error("Product Not Found");
    }

    return {
        ProductId:Product.productId,
        ProductName:Product.productName,
        ProductDescription:Product.description,
        ProductImage:Product.productImage,
         rating:Product.rating,
            reviewCount:Product.reviewCount
    }

}