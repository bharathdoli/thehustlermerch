import { NextResponse } from "next/server";

import { refundPaymentUseCase } from "@/src/backend/application/payment/refund-payment.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const payment = await refundPaymentUseCase(paymentId);
    return NextResponse.json(payment);
  } catch (error) {
    return handleApiError(error);
  }
}