import { prisma } from "@/src/lib/db/prisma";
import { UpdateCouponInput, UpdateCouponSchema } from "@/src/schema/coupon.schema";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function updateCouponUseCase(
  couponId: string,
  input: UpdateCouponInput
) {
  await requireAdmin();

  const data = UpdateCouponSchema.parse(input);

  const existing = await prisma.coupon.findUnique({ where: { couponId } });

  if (!existing) {
    throw new AppError("Coupon not found.", 404);
  }

  const coupon = await prisma.coupon.update({
    where: { couponId },
    data,
  });

  return coupon;
}