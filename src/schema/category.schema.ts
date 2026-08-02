import { z } from "zod";

export const CreateCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(3, "Category name should contain at least 3 characters.")
    .max(100),

  description: z
    .string()
    .trim()
    .max(500)
    .optional(),

  imageUrl: z
    .url()
    .optional()
    .or(z.literal(""))
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;