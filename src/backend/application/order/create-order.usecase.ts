import { prisma } from "@/src/lib/db/prisma";
import { OrderStatus } from "@/src/generated/prisma/enums";
import { AppError } from "@/src/backend/shared/errors/api/AppError";
import { calculateCouponDiscount } from "@/src/backend/domain/services/CouponService";
import { CreateOrderInput, CreateOrderSchema } from "@/src/schema/order.schema";
import { requireUser } from "../../shared/auth/session-validation";
import { decrementStock } from "../../domain/services/InventoryService";

export async function createOrderUseCase(input: CreateOrderInput) {
  const currentUser = await requireUser();

  const data = CreateOrderSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    // 1. Load the cart
    const cart = await tx.cart.findUnique({
      where: { userId: currentUser.id },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty.", 400);
    }

    // 2. Load & verify the shipping address belongs to this user
    const address = await tx.address.findUnique({
      where: { addressId: data.addressId },
    });

    if (!address) {
      throw new AppError("Address not found.", 404);
    }

    if (address.userId !== currentUser.id) {
      throw new AppError("This address does not belong to you.", 403);
    }

    // 3. Subtotal from Item.unitPrice — frozen when each item was added to cart
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0
    );

    // 4. Coupon — optional. Validated AND consumed here (not in the
    // preview endpoint), so previewing a discount never burns the usage limit.
    let discountAmount = 0;
    let couponId: string | null = null;

    if (data.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (!coupon) {
        throw new AppError("Invalid or inactive coupon code.", 400);
      }

      discountAmount = calculateCouponDiscount(coupon, subtotal);
      couponId = coupon.couponId;

      await tx.coupon.update({
        where: { couponId: coupon.couponId },
        data: { usageCount: { increment: 1 } },
      });
    }

    const shippingCost = data.shippingCost ?? 0;
    const totalAmount = subtotal - discountAmount + shippingCost;

    // 5. Atomically decrement stock — the real, race-safe stock check.
    await decrementStock(
      tx,
      cart.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    // 6. Create the order, snapshotting the address at time of purchase
    const order = await tx.order.create({
      data: {
        userId: currentUser.id,
        status: OrderStatus.pending,
        subtotal,
        discountAmount,
        shippingCost,
        totalAmount,
        couponId,
        shippingName: address.recipientName,
        shippingPhone: address.recipientPhone,
        shippingAddressLine1: address.addressLine1,
        shippingAddressLine2: address.addressLine2,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPincode: address.pincode,
        shippingCountry: address.country,
      },
    });

    // 7. Move the cart's items onto the order — they leave the cart for good
    await tx.item.updateMany({
      where: { cartId: cart.cartId },
      data: { orderId: order.orderId, cartId: null },
    });

    // 8. First status log entry — start of the customer-facing timeline
    await tx.orderStatusLog.create({
      data: {
        orderId: order.orderId,
        status: OrderStatus.pending,
        note: "Order placed",
      },
    });

    return tx.order.findUniqueOrThrow({
      where: { orderId: order.orderId },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        statusLogs: true,
      },
    });
  });
}