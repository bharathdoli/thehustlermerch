import { NextResponse } from "next/server";

import { getCartUseCase } from "@/src/backend/application/cart/get-cart.usecase";
import { addToCartUseCase } from "@/src/backend/application/cart/add-to-cart.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET() {
  try {
    const cart = await getCartUseCase();
    return NextResponse.json(cart);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await addToCartUseCase(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}