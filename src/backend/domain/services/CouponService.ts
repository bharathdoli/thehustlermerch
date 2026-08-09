import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { Coupon } from "@/src/generated/prisma/client";

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
  if (!coupon.isActive) {
    throw new AppError("Invalid or inactive coupon code.", 400);
  }

  const now = new Date();

  if (coupon.validFrom && now < coupon.validFrom) {
    throw new AppError("This coupon is not active yet.", 400);
  }

  if (coupon.validUntil && now > coupon.validUntil) {
    throw new AppError("This coupon has expired.", 400);
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("This coupon has reached its usage limit.", 400);
  }

  const minOrderAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;

  if (subtotal < minOrderAmount) {
    throw new AppError(`This coupon requires a minimum order of ₹${minOrderAmount}.`, 400);
  }

  let discountAmount: number;

  if (coupon.type === "Percentage") {
    discountAmount = (subtotal * Number(coupon.value)) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
    }
  } else {
    discountAmount = Number(coupon.value);
  }

  return Math.min(discountAmount, subtotal);
}