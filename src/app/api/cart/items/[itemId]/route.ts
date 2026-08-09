import { NextResponse } from "next/server";

import { updateCartItemUseCase } from "@/src/backend/application/cart/update-cart-item.usecase";
import { removeCartItemUseCase } from "@/src/backend/application/cart/remove-cart-item.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const item = await updateCartItemUseCase(itemId, body);
    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const result = await removeCartItemUseCase(itemId);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}