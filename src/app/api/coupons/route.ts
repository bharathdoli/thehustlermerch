import { NextResponse } from "next/server";

import { listCouponsUseCase } from "@/src/backend/application/coupon/list-coupons.usecase";
import { createCouponUseCase } from "@/src/backend/application/coupon/create-coupon.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET() {
  try {
    const coupons = await listCouponsUseCase();
    return NextResponse.json(coupons);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coupon = await createCouponUseCase(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}