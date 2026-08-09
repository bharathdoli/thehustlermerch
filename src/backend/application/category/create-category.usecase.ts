import { prisma } from "../../../lib/db/prisma";

import {
    CreateCategorySchema,
    CreateCategoryInput
} from "../../../schema/category.schema";

import { requireAdmin } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";

export async function createCategoryUseCase(
    input: CreateCategoryInput
) {

  
    await requireAdmin();

    const data = CreateCategorySchema.parse(input);

    const exists = await prisma.category.findFirst({
        where: {
            categoryName: data.categoryName
        }
    });

    if (exists) {
        throw new AppError("Category already exists.",409);
    }

    const category = await prisma.category.create({
        data: {
            categoryName: data.categoryName,
            description: data.description,
            imageUrl: data.imageUrl
        }
    });

    return {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        description: category.description,
        imageUrl: category.imageUrl
    };
}