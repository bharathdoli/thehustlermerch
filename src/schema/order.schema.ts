import { z } from "zod";

export const CreateOrderSchema = z.object({
  addressId: z.uuid(),
  couponCode: z.string().trim().optional(),
  shippingCost: z.coerce.number().nonnegative().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "paymentConfirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  note: z.string().trim().max(300).optional(),
  trackingId: z.string().trim().max(100).optional(),
  courierName: z.string().trim().max(100).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;