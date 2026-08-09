import { prisma } from "@/src/lib/db/prisma";
import { ValidateCouponInput, ValidateCouponSchema } from "@/src/schema/coupon.schema";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { calculateCouponDiscount } from "@/src/backend/domain/services/CouponService";
import { requireUser } from "../../shared/auth/session-validation";

export async function validateCouponUseCase(input: ValidateCouponInput) {
  await requireUser();

  const data = ValidateCouponSchema.parse(input);

  const coupon = await prisma.coupon.findUnique({
    where: { code: data.code },
  });

  if (!coupon) {
    throw new AppError("Invalid or inactive coupon code.", 400);
  }

  const discountAmount = calculateCouponDiscount(coupon, data.subtotal);

  // usageCount is NOT incremented here — this is preview-only.
  // create-order.usecase.ts increments it when the coupon is actually consumed.

  return { coupon, discountAmount };
}