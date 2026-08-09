import { prisma } from "@/src/lib/db/prisma";
import { PaymentStatus } from "@/src/generated/prisma/enums";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { requireAdmin } from "../../shared/auth/session-validation";

export async function refundPaymentUseCase(paymentId: string) {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({ where: { paymentId } });

  if (!payment) {
    throw new AppError("Payment not found.", 404);
  }

  if (payment.status !== PaymentStatus.paid) {
    throw new AppError(`Cannot refund a payment that is "${payment.status}".`, 400);
  }

  const updated = await prisma.payment.update({
    where: { paymentId },
    data: { status: PaymentStatus.refunded },
  });

  return updated;
}