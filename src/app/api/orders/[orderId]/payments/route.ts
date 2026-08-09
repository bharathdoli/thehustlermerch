import { NextResponse } from "next/server";

import { listPaymentsUseCase } from "@/src/backend/application/payment/list-payments.usecase";
import { recordPaymentUseCase } from "@/src/backend/application/payment/record-payment.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const payments = await listPaymentsUseCase(orderId);
    return NextResponse.json(payments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const payment = await recordPaymentUseCase(orderId, body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}