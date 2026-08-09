import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "../../shared/errors/api/AppError";


export async function getCategoryUseCase(id: string){

    const category = await prisma.category.findFirst({
        where:{
            categoryId:id
        }
    })

    if(!category){
        throw new AppError("Category Not Found",404);
    }

    return {
        categoryId:category.categoryId,
        categoryName:category.categoryName,
        categoryDescription:category.description,
        categoryImage:category.imageUrl
    }

}