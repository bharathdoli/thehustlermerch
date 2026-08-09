import { z } from "zod";

export const AddToCartSchema = z.object({
  variantId: z.uuid(),
  quantity: z.coerce.number().int().positive().default(1),
  customizationLogoFront: z.url().optional().or(z.literal("")),
  customizationLogoBack: z.url().optional().or(z.literal("")),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;