import { prisma } from "@/src/lib/db/prisma";
import { UpdateCategoryInput, UpdateCategorySchema } from "@/src/schema/category.schema";
import { requireAdmin } from "../../shared/auth/session-validation";



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
    throw new Error("Category not found.");
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
      throw new Error("Category name already exists.");
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