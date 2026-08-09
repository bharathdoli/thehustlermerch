import { NextResponse } from "next/server";

import { getVariantUseCase } from "@/src/backend/application/product-variant/get-variant.usecase";
import { updateVariantUseCase } from "@/src/backend/application/product-variant/update-variant.usecase";
import { deleteVariantUseCase } from "@/src/backend/application/product-variant/delete-variant.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await params;
  
    const variant = await getVariantUseCase(variantId);
  
    return NextResponse.json(variant);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
 
  try {
     const { variantId } = await params;

  const body = await request.json();
    const variant = await updateVariantUseCase(variantId, body);
  
    return NextResponse.json(variant);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const { variantId } = await params;

  try {
    const result = await deleteVariantUseCase(variantId);
  
    return NextResponse.json(result);
  } catch (error) {
      return handleApiError(error);
  }
}