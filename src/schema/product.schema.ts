import { z } from "zod";

export const CreateProductSchema = z.object({

    categoryId: z.uuid().optional(),

    productName: z
        .string()
        .trim()
        .min(3)
        .max(100),

    description: z
        .string()
        .trim()
        .max(1000)
        .optional(),

    productImage: z
        .url()
        .optional()
        .or(z.literal("")),
    
    rating: z.number().multipleOf(0.01).optional(),
    reviewCount: z.number().optional(),
});

export type CreateProductInput =
z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema =
CreateProductSchema.partial();

export type UpdateProductInput =
z.infer<typeof UpdateProductSchema>;