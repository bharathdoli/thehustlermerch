import { NextResponse } from "next/server";

import { getCouponUseCase } from "@/src/backend/application/coupon/get-coupon.usecase";
import { updateCouponUseCase } from "@/src/backend/application/coupon/update-coupon.usecase";
import { deactivateCouponUseCase } from "@/src/backend/application/coupon/deactivate-coupon.usecase";
import { handleApiError } from "@/src/backend/shared/errors/api/handle-api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const { couponId } = await params;
    const coupon = await getCouponUseCase(couponId);
    return NextResponse.json(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const { couponId } = await params;
    const body = await request.json();
    const coupon = await updateCouponUseCase(couponId, body);
    return NextResponse.json(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const { couponId } = await params;
    const coupon = await deactivateCouponUseCase(couponId);
    return NextResponse.json(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}