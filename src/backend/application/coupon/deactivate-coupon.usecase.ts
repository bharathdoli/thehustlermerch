import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function deactivateCouponUseCase(couponId: string) {
  await requireAdmin();

  const existing = await prisma.coupon.findUnique({ where: { couponId } });

  if (!existing) {
    throw new AppError("Coupon not found.", 404);
  }

  const coupon = await prisma.coupon.update({
    where: { couponId },
    data: { isActive: false },
  });

  return coupon;
}