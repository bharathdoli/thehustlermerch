import { NextResponse } from "next/server";

import { cancelOrderUseCase } from "@/src/backend/application/order/cancel-order.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await cancelOrderUseCase(orderId);
    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}