export type Review = {
  rid: string;
  productId: string;
  userId?: string;
  orderId?: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
};

/** Frontend-only resolved shape with the reviewer's display name attached. */
export type ResolvedReview = Review & {
  userName: string;
  verifiedPurchase: boolean;
};

export type RatingBreakdown = {
  average: number;
  total: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
};