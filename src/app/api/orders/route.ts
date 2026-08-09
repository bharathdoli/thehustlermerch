import { NextResponse } from "next/server";

import { createOrderUseCase } from "@/src/backend/application/order/create-order.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";
import { listOrdersUseCase } from "@/src/backend/application/order/list-orders.usecase";

export async function GET() {
  try {
    const orders = await listOrdersUseCase();
    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createOrderUseCase(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}