import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function getCouponUseCase(couponId: string) {
  await requireAdmin();

  const coupon = await prisma.coupon.findUnique({ where: { couponId } });

  if (!coupon) {
    throw new AppError("Coupon not found.", 404);
  }

  return coupon;
}