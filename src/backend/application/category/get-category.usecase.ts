import { prisma } from "@/src/lib/db/prisma";


export async function getCategoryUseCase(id: string){

    const category = await prisma.category.findFirst({
        where:{
            categoryId:id
        }
    })

    if(!category){
        throw new Error("Category Not Found");
    }

    return {
        categoryId:category.categoryId,
        categoryName:category.categoryName,
        categoryDescription:category.description,
        categoryImage:category.imageUrl
    }

}