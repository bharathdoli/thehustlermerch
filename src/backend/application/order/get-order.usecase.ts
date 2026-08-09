import { prisma } from "@/src/lib/db/prisma";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireUser } from "../../shared/auth/session-validation";

export async function getOrderUseCase(orderId: string) {
  const currentUser = await requireUser();

  const order = await prisma.order.findUnique({
    where: { orderId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      payments: true,
      statusLogs: { orderBy: { changedAt: "asc" } },
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (order.userId !== currentUser.id && currentUser.role !== "Admin") {
    throw new AppError("You are not allowed to view this order.", 403);
  }

  return order;
}