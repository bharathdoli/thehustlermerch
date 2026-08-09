import { NextResponse } from "next/server";

import { validateCouponUseCase } from "@/src/backend/application/coupon/validate-coupon.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await validateCouponUseCase(body);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}