import { prisma } from "@/src/lib/db/prisma";
import { UpdateCategoryInput, UpdateCategorySchema } from "@/src/schema/category.schema";
import { requireAdmin } from "../../shared/auth/session-validation";
import { AppError } from "../../shared/errors/api/AppError";



export async function updateCategoryUseCase(
  categoryId: string,
  input: UpdateCategoryInput
) {

  // Authentication

  await requireAdmin();

  // Validation
  const data = UpdateCategorySchema.parse(input);

  // Check category exists
  const existingCategory = await prisma.category.findUnique({
    where: {
      categoryId,
    },
  });

  if (!existingCategory) {
    throw new AppError("Category not found.",404);
  }

  // Prevent duplicate names
  if (data.categoryName) {
    const duplicate = await prisma.category.findFirst({
      where: {
        categoryName: data.categoryName,
        NOT: {
          categoryId,
        },
      },
    });

    if (duplicate) {
      throw new AppError("Category name already exists.",409);
    }
  }

  // Update
  const category = await prisma.category.update({
    where: {
      categoryId,
    },
    data,
  });

  return {
    categoryId: category.categoryId,
    categoryName: category.categoryName,
    description: category.description,
    imageUrl: category.imageUrl,
  };
}