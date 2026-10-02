import { z } from "zod";

export const CreateReviewSchema = z.object({
  productId: z.uuid(),

  userId: z.uuid().optional(),

  orderId: z.uuid().optional(),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5),

  comment: z
    .string()
    .trim()
    .max(1000)
    .optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

// Updates: usually you only let a user edit rating/comment,
// not productId/userId/orderId — those define *which* review this is.
export const UpdateReviewSchema = CreateReviewSchema.pick({
  rating: true,
  comment: true,
}).partial();

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;