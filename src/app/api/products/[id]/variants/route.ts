import { NextResponse } from "next/server";

import { listVariantsUseCase } from "@/src/backend/application/product-variant/list-variants.usecase";
import { createVariantUseCase } from "@/src/backend/application/product-variant/create-variant.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
  
    const variants = await listVariantsUseCase(productId);
  
    return NextResponse.json(variants);
  } catch (error) {
     return  handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;

  try {
    const body = await request.json();
  
    const variant = await createVariantUseCase(productId, body);
  
    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
      return handleApiError(error);
  }
}