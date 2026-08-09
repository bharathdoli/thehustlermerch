import { NextResponse } from "next/server";

import { updateOrderStatusUseCase } from "@/src/backend/application/order/update-order-status.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const order = await updateOrderStatusUseCase(orderId, body);
    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}