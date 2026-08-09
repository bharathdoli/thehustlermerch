import { NextResponse } from "next/server";

import { getOrderUseCase } from "@/src/backend/application/order/get-order.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getOrderUseCase(orderId);
    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}