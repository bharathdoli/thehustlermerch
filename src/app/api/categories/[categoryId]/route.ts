import { NextResponse } from "next/server";

import { getCategoryUseCase } from "@/src/backend/application/category/get-category.usecase";
import { updateCategoryUseCase } from "@/src/backend/application/category/update-category.usecase";
import { deleteCategoryUseCase } from "@/src/backend/application/category/delete-category.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { categoryIdSchema } from "@/src/schema/category.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  
  try {
    const { categoryId } = await params;

    const data = categoryIdSchema.parse(categoryId);

    const category = await getCategoryUseCase(categoryId);
  
    return NextResponse.json(category);
  } catch (error) {
     return  handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
 
  try {
     const { categoryId } = await params;

  const body = await request.json();

    const category = await updateCategoryUseCase(categoryId, body);
  
    return NextResponse.json(category);
  } catch (error) {
      return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  
  try {
    const { categoryId } = await params;

    const result = await deleteCategoryUseCase(categoryId);
  
    return NextResponse.json(result);
  } catch (error) {
    return  handleApiError(error);
  }
}