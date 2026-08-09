import { prisma } from "@/src/lib/db/prisma";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function listCouponsUseCase() {
  await requireAdmin();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return coupons;
}