import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireUser } from "../../shared/auth/session-validation";

export async function listPaymentsUseCase(orderId: string) {
  const currentUser = await requireUser();

  const order = await prisma.order.findUnique({ where: { orderId } });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.userId !== currentUser.id && currentUser.role !== "Admin") {
    throw new AppError("You are not allowed to view these payments.", 403);
  }

  const payments = await prisma.payment.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  return payments;
}