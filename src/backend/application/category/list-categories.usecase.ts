import { prisma } from "../../../lib/db/prisma";

export async function listCategoriesUseCase() {

    const categories = await prisma.category.findMany({

        orderBy: {
            categoryName: "asc"
        }

    });

    return categories.map(category => ({

        categoryId: category.categoryId,

        categoryName: category.categoryName,

        description: category.description,

        imageUrl: category.imageUrl

    }));

}