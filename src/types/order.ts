export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  orderId: string;
  cartId: string;
  status: OrderStatus;
  totalAmount: number;
};

export type PaymentStatus = "initiated" | "paid" | "failed" | "refunded";

export type Payment = {
  paymentId: string;
  orderId: string;
  paymentMode?: string;
  gatewayTxnId?: string;
  status: PaymentStatus;
  amount: number;
  createdAt: string;
};

/**
 * Frontend-only resolved shape combining Order + Payment + resolved cart
 * items, for the order detail / order confirmation screens.
 */
export type ResolvedOrder = Order & {
  payment?: Payment;
  placedAt: string;
};  