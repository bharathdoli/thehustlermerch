import { prisma } from "@/src/lib/db/prisma";
import { OrderStatus } from "@/src/generated/prisma/enums";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { restockItems } from "@/src/backend/domain/services/InventoryService";
import { UpdateOrderStatusInput, UpdateOrderStatusSchema } from "@/src/schema/order.schema";
import { requireAdmin } from "../../shared/auth/session-validation";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.pending]: [OrderStatus.paymentConfirmed, OrderStatus.cancelled],
  [OrderStatus.paymentConfirmed]: [OrderStatus.processing, OrderStatus.cancelled],
  [OrderStatus.processing]: [OrderStatus.shipped, OrderStatus.cancelled],
  [OrderStatus.shipped]: [OrderStatus.delivered],
  [OrderStatus.delivered]: [],
  [OrderStatus.cancelled]: [],
};

export async function updateOrderStatusUseCase(
  orderId: string,
  input: UpdateOrderStatusInput
) {
  await requireAdmin();

  const data = UpdateOrderStatusSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { orderId } });

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    const allowedNext = VALID_TRANSITIONS[order.status];

    if (!allowedNext.includes(data.status as OrderStatus)) {
      throw new AppError(
        `Cannot move order from "${order.status}" to "${data.status}".`,
        400
      );
    }

    const updated = await tx.order.update({
      where: { orderId },
      data: {
        status: data.status,
        trackingId: data.trackingId ?? order.trackingId,
        courierName: data.courierName ?? order.courierName,
      },
    });

    await tx.orderStatusLog.create({
      data: { orderId, status: data.status, note: data.note },
    });

    if (data.status === OrderStatus.cancelled) {
      const items = await tx.item.findMany({ where: { orderId } });
      await restockItems(
        tx,
        items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      );
    }

    return updated;
  });
}