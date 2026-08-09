import { z } from "zod";

export const CreateCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .transform((val) => val.toUpperCase()),
    type: z.enum(["Percentage", "Flat"]),
    value: z.coerce.number().positive(),
    minOrderAmount: z.coerce.number().nonnegative().optional(),
    maxDiscountAmount: z.coerce.number().positive().optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    usageLimit: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.type !== "Percentage" || data.value <= 100, {
    message: "Percentage discount value cannot exceed 100.",
    path: ["value"],
  })
  .refine(
    (data) => !data.validFrom || !data.validUntil || data.validFrom <= data.validUntil,
    { message: "validFrom must be before validUntil.", path: ["validUntil"] }
  );

export type CreateCouponInput = z.infer<typeof CreateCouponSchema>;

export const UpdateCouponSchema = z.object({
  type: z.enum(["Percentage", "Flat"]).optional(),
  value: z.coerce.number().positive().optional(),
  minOrderAmount: z.coerce.number().nonnegative().optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCouponInput = z.infer<typeof UpdateCouponSchema>;

export const ValidateCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .transform((val) => val.toUpperCase()),
  subtotal: z.coerce.number().positive(),
});

export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>;