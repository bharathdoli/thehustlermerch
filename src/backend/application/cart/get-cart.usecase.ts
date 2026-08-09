import { prisma } from "@/src/lib/db/prisma";
import { requireUser } from "../../shared/auth/session-validation";

export async function getCartUseCase() {
  const currentUser = await requireUser();

  const cart = await prisma.cart.findUnique({
    where: { userId: currentUser.id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!cart) {
    return { cartId: null, items: [], subtotal: 0 };
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  );

  return { cartId: cart.cartId, items: cart.items, subtotal };
}