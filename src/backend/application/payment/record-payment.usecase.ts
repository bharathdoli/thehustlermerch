import { prisma } from "@/src/lib/db/prisma";
import { OrderStatus, PaymentStatus } from "@/src/generated/prisma/enums";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { RecordPaymentInput, RecordPaymentSchema } from "@/src/schema/payment.schema";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function recordPaymentUseCase(
  orderId: string,
  input: RecordPaymentInput
) {
  await requireAdmin();

  const data = RecordPaymentSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    if (order.status !== OrderStatus.pending) {
      throw new AppError(
        `Cannot record payment for an order that is "${order.status}".`,
        400
      );
    }

    const alreadyPaid = order.payments.some((p) => p.status === PaymentStatus.paid);

    if (alreadyPaid) {
      throw new AppError("This order already has a recorded payment.", 400);
    }

    if (data.amount !== Number(order.totalAmount)) {
      throw new AppError(
        `Payment amount (₹${data.amount}) does not match the order total (₹${order.totalAmount}).`,
        400
      );
    }

    const payment = await tx.payment.create({
      data: {
        orderId,
        paymentMode: data.paymentMode,
        gatewayTxnId: data.gatewayTxnId,
        amount: data.amount,
        status: PaymentStatus.paid,
      },
    });

    await tx.order.update({
      where: { orderId },
      data: { status: OrderStatus.paymentConfirmed },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId,
        status: OrderStatus.paymentConfirmed,
        note: `Payment recorded manually via ${data.paymentMode}`,
      },
    });

    return payment;
  });
}