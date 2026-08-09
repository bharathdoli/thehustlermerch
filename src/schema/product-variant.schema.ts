import { z } from "zod";

export const CreateProductVariantSchema = z.object({
  colour: z
    .string()
    .trim()
    .max(50)
    .optional(),

  size: z
    .string()
    .trim()
    .max(50)
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  stockQuantity: z.coerce
    .number()
    .int()
    .nonnegative("Stock cannot be negative")
    .optional(),
});

export type CreateProductVariantInput = z.infer<typeof CreateProductVariantSchema>;

export const UpdateProductVariantSchema = CreateProductVariantSchema.partial();

export type UpdateProductVariantInput = z.infer<typeof UpdateProductVariantSchema>;