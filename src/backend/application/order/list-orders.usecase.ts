import { prisma } from "@/src/lib/db/prisma";
import { requireUser } from "../../shared/auth/session-validation";

export async function listOrdersUseCase() {
  const currentUser = await requireUser();

  const orders = await prisma.order.findMany({
    where: currentUser.role === "Admin" ? {} : { userId: currentUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      statusLogs: { orderBy: { changedAt: "asc" } },
    },
  });

  return orders;
}