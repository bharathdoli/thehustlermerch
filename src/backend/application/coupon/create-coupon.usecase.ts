import { prisma } from "@/src/lib/db/prisma";
import { CreateCouponInput, CreateCouponSchema } from "@/src/schema/coupon.schema";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function createCouponUseCase(input: CreateCouponInput) {
  await requireAdmin();

  const data = CreateCouponSchema.parse(input);

  const existing = await prisma.coupon.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new AppError("A coupon with this code already exists.", 400);
  }

  const coupon = await prisma.coupon.create({ data });

  return coupon;
}