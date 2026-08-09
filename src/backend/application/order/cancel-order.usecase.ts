import { prisma } from "@/src/lib/db/prisma";
import { OrderStatus } from "@/src/generated/prisma/enums";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { restockItems } from "@/src/backend/domain/services/InventoryService";
import { requireUser } from "../../shared/auth/session-validation";

const CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.pending, OrderStatus.paymentConfirmed];

export async function cancelOrderUseCase(orderId: string) {
  const currentUser = await requireUser();

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderId },
      include: { items: true },
    });

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    if (order.userId !== currentUser.id && currentUser.role !== "Admin") {
      throw new AppError("You are not allowed to cancel this order.", 403);
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new AppError(`Order cannot be cancelled once it is "${order.status}".`, 400);
    }

    await restockItems(
      tx,
      order.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
    );

    const updated = await tx.order.update({
      where: { orderId },
      data: { status: OrderStatus.cancelled },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        status: OrderStatus.cancelled,
        note: `Cancelled by ${currentUser.role === "Admin" ? "admin" : "customer"}`,
      },
    });

    return updated;
  });
}