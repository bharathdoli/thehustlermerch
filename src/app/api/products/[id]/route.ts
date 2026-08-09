import { deleteProductUseCase } from "@/src/backend/application/product/delete-product.usecase";
import { getProductUseCase } from "@/src/backend/application/product/get-product.usecase";
import { updateProductUseCase } from "@/src/backend/application/product/update-product.usecase";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  try {
    const product = await getProductUseCase(productId);
  
    return NextResponse.json(product);
  } catch (error) {
    return  handleApiError(error);
}
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  const body = await request.json();

  try {
    const product = await updateProductUseCase(productId, body);
  
    return NextResponse.json(product);
  } catch (error) {
  if (error instanceof AppError) {
    return handleApiError(error);
  }
}
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
  
    const result = await deleteProductUseCase(productId);
  
    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
  }
}