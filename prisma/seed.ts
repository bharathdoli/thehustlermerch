import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  DiscountType,
} from "@/src/generated/prisma/enums";
import { prisma } from "@/src/lib/db/prisma";

async function main() {
  console.log("Seeding...");

  // ── 1. Users ─────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@printingpress.com" },
    update: {},
    create: {
      uname: "Admin",
      email: "admin@printingpress.com",
      password: "Password@123",
      phoneNo: "9999999999",
      role: UserRole.Admin,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      uname: "Test Customer",
      email: "customer@example.com",
      password: "Password@123",
      phoneNo: "8888888888",
      role: UserRole.Customer,
    },
  });

  // ── 2. Address (recipientName/recipientPhone required) ────────────
  let address = await prisma.address.findFirst({
    where: { userId: customer.uid },
  });

  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: customer.uid,
        recipientName: "Anjali Rao",
        recipientPhone: "8888888888",
        addressLine1: "12 MG Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        isDefault: true,
      },
    });
  }

  // ── 3. Categories -> Products -> Variants ──────────────────────────
  const catalog = [
    {
      categoryName: "T-Shirts",
      description: "Custom printed t-shirts",
      products: [
        {
          productName: "Classic Round Neck T-Shirt",
          description: "180gsm cotton, custom front/back print",
          variants: [
            { colour: "White", size: "M", price: 399, stockQuantity: 100 },
            { colour: "White", size: "L", price: 399, stockQuantity: 100 },
            { colour: "Black", size: "M", price: 429, stockQuantity: 80 },
            { colour: "Black", size: "L", price: 429, stockQuantity: 80 },
          ],
        },
      ],
    },
    {
      categoryName: "Hoodies",
      description: "Custom printed hoodies",
      products: [
        {
          productName: "Pullover Hoodie",
          description: "320gsm fleece, custom front/back print",
          variants: [
            { colour: "Grey Melange", size: "M", price: 999, stockQuantity: 50 },
            { colour: "Grey Melange", size: "L", price: 999, stockQuantity: 50 },
            { colour: "Black", size: "L", price: 1049, stockQuantity: 40 },
          ],
        },
      ],
    },
    {
      categoryName: "Caps",
      description: "Custom embroidered/printed caps",
      products: [
        {
          productName: "Cotton Baseball Cap",
          description: "Adjustable strap, front logo print",
          variants: [
            { colour: "Black", size: "Free Size", price: 299, stockQuantity: 150 },
            { colour: "Navy", size: "Free Size", price: 299, stockQuantity: 150 },
          ],
        },
      ],
    },
    {
      categoryName: "Mugs & Cups",
      description: "Custom printed mugs and cups",
      products: [
        {
          productName: "Ceramic Coffee Mug",
          description: "11oz, dishwasher-safe print",
          variants: [
            { colour: "White", size: "11oz", price: 249, stockQuantity: 200 },
            { colour: "Black Inner", size: "11oz", price: 279, stockQuantity: 120 },
          ],
        },
      ],
    },
  ];

  for (const cat of catalog) {
    const existingCategory = await prisma.category.findFirst({
      where: { categoryName: cat.categoryName },
    });
    if (existingCategory) continue;

    await prisma.category.create({
      data: {
        categoryName: cat.categoryName,
        description: cat.description,
        products: {
          create: cat.products.map((p) => ({
            productName: p.productName,
            description: p.description,
            variants: {
              create: p.variants.map((v) => ({
                colour: v.colour,
                size: v.size,
                price: v.price,
                stockQuantity: v.stockQuantity,
              })),
            },
          })),
        },
      },
    });
  }

  // Pull the two variants we'll use below, whether just created or
  // already there from a previous run.
  const capVariant = await prisma.productVariant.findFirstOrThrow({
    where: {
      colour: "Black",
      size: "Free Size",
      product: { productName: "Cotton Baseball Cap" },
    },
  });

  const hoodieVariant = await prisma.productVariant.findFirstOrThrow({
    where: {
      colour: "Grey Melange",
      size: "L",
      product: { productName: "Pullover Hoodie" },
    },
  });

  // ── 4. Coupon ────────────────────────────────────────────────────
  const coupon = await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: DiscountType.Percentage,
      value: 10,
      minOrderAmount: 500,
      maxDiscountAmount: 200,
      isActive: true,
    },
  });

  // ── 5. Active cart item — for YOU to check out via Postman ─────────
  const cart = await prisma.cart.upsert({
    where: { userId: customer.uid },
    update: {},
    create: { userId: customer.uid },
  });

  const existingCartItem = await prisma.item.findFirst({
    where: { cartId: cart.cartId },
  });

  if (!existingCartItem) {
    await prisma.item.create({
      data: {
        userId: customer.uid,
        cartId: cart.cartId,
        variantId: hoodieVariant.variantId,
        quantity: 1,
        unitPrice: hoodieVariant.price,
      },
    });
  }

  // ── 6. One fully completed demo order — for testing GET endpoints ──
  // Only seeded once. If you want a fresh one, delete existing Orders
  // for this customer first.
  const existingOrder = await prisma.order.findFirst({
    where: { userId: customer.uid },
  });

  let demoOrder = existingOrder;

  if (!existingOrder) {
    const quantity = 2;
    const subtotal = Number(capVariant.price) * quantity; // 598
    const discountAmount = Math.min(
      (subtotal * Number(coupon.value)) / 100,
      Number(coupon.maxDiscountAmount)
    ); // 59.8
    const shippingCost = 50;
    const totalAmount = subtotal - discountAmount + shippingCost; // 588.2

    demoOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: customer.uid,
          status: OrderStatus.delivered,
          subtotal,
          discountAmount,
          shippingCost,
          totalAmount,
          couponId: coupon.couponId,
          shippingName: address.recipientName,
          shippingPhone: address.recipientPhone,
          shippingAddressLine1: address.addressLine1,
          shippingAddressLine2: address.addressLine2,
          shippingCity: address.city,
          shippingState: address.state,
          shippingPincode: address.pincode,
          shippingCountry: address.country,
          trackingId: "TRK123456789",
          courierName: "Delhivery",
        },
      });

      await tx.item.create({
        data: {
          userId: customer.uid,
          orderId: order.orderId,
          variantId: capVariant.variantId,
          quantity,
          unitPrice: capVariant.price,
        },
      });

      await tx.productVariant.update({
        where: { variantId: capVariant.variantId },
        data: { stockQuantity: { decrement: quantity } },
      });

      await tx.coupon.update({
        where: { couponId: coupon.couponId },
        data: { usageCount: { increment: 1 } },
      });

      await tx.payment.create({
        data: {
          orderId: order.orderId,
          paymentMode: "UPI",
          amount: totalAmount,
          status: PaymentStatus.paid,
        },
      });

      const stages: { status: OrderStatus; note: string }[] = [
        { status: OrderStatus.pending, note: "Order placed" },
        { status: OrderStatus.paymentConfirmed, note: "Payment recorded manually via UPI" },
        { status: OrderStatus.processing, note: "Printing and packing" },
        { status: OrderStatus.shipped, note: "Handed to courier" },
        { status: OrderStatus.delivered, note: "Delivered to customer" },
      ];

      for (const stage of stages) {
        await tx.orderStatusLog.create({
          data: { orderId: order.orderId, status: stage.status, note: stage.note },
        });
      }

      return order;
    });
  }

  console.log("Seed complete.\n");
  console.log("── Postman test data ─────────────────────────────");
  console.log("Admin login   :", admin.email, "/ Password@123");
  console.log("Customer login:", customer.email, "/ Password@123");
  console.log("Address ID    :", address.addressId);
  console.log("Cap variant   :", capVariant.variantId, `(₹${capVariant.price}, stock now check DB)`);
  console.log("Hoodie variant:", hoodieVariant.variantId, `(₹${hoodieVariant.price})`);
  console.log("Coupon code   : WELCOME10");
  console.log("Cart has 1x hoodie waiting — POST /api/orders with addressId above to test checkout");
  console.log("Demo order ID :", demoOrder!.orderId, "(status: delivered, full history + payment)");
  console.log("──────────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });