import { NextResponse } from "next/server";

import { getCategoryUseCase } from "@/src/backend/application/category/get-category.usecase";
import { updateCategoryUseCase } from "@/src/backend/application/category/update-category.usecase";
import { deleteCategoryUseCase } from "@/src/backend/application/category/delete-category.usecase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;

  const category = await getCategoryUseCase(categoryId);

  return NextResponse.json(category);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;

  const body = await request.json();

  const category = await updateCategoryUseCase(categoryId, body);

  return NextResponse.json(category);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;

  const result = await deleteCategoryUseCase(categoryId);

  return NextResponse.json(result);
}