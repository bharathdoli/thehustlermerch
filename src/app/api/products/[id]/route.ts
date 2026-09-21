import { deleteProductUseCase } from "@/src/backend/application/product/delete-product.usecase";
import { getProductUseCase } from "@/src/backend/application/product/get-product.usecase";
import { updateProductUseCase } from "@/src/backend/application/product/update-product.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await getProductUseCase(id);
  
    return NextResponse.json(product);
  } catch (error) {
    return  handleApiError(error);
}
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await request.json();

  try {
    const product = await updateProductUseCase(id, body);
  
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
  
    const result = await deleteProductUseCase(id);
  
    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
  }
}