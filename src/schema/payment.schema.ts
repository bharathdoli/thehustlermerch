import { z } from "zod";

export const RecordPaymentSchema = z.object({
  paymentMode: z.string().trim().min(2).max(50), // "UPI", "Cash", "Bank Transfer", etc.
  amount: z.coerce.number().positive(),
  gatewayTxnId: z.string().trim().max(100).optional(),
});

export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>;