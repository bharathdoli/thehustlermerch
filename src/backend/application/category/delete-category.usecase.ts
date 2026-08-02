import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function deleteCategoryUseCase(categoryId: string) {

  // Authentication
  await requireAdmin();

  // Check category exists
  const category = await prisma.category.findUnique({
    where: {
      categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  // Delete
  await prisma.category.delete({
    where: {
      categoryId,
    },
  });

  return {
    message: "Category deleted successfully.",
  };
}