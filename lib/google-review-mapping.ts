export type GoogleReviewPayload = {
  name?: string;
  reviewId?: string;
  reviewer?: {
    displayName?: string;
    isAnonymous?: boolean;
    profilePhotoUrl?: string;
  };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: {
    comment?: string;
    updateTime?: string;
    reviewReplyState?: string;
  };
};

export type GoogleReviewPreview = {
  googleReviewId: string | null;
  resourceName: string | null;
  author: {
    displayName: string | null;
    isAnonymous: boolean;
    profilePhotoUrl: string | null;
  };
  rating: number | null;
  comment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  ownerReply: {
    comment: string | null;
    updatedAt: string | null;
    state: string | null;
  } | null;
};

function mapRating(value: string | undefined) {
  const ratings = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as const;
  return value && value in ratings ? ratings[value as keyof typeof ratings] : null;
}

export function mapGoogleReview(review: GoogleReviewPayload): GoogleReviewPreview {
  return {
    googleReviewId: review.reviewId ?? null,
    resourceName: review.name ?? null,
    author: {
      displayName: review.reviewer?.displayName ?? null,
      isAnonymous: Boolean(review.reviewer?.isAnonymous),
      profilePhotoUrl: review.reviewer?.profilePhotoUrl ?? null,
    },
    rating: mapRating(review.starRating),
    comment: review.comment ?? null,
    createdAt: review.createTime ?? null,
    updatedAt: review.updateTime ?? null,
    ownerReply: review.reviewReply
      ? {
          comment: review.reviewReply.comment ?? null,
          updatedAt: review.reviewReply.updateTime ?? null,
          state: review.reviewReply.reviewReplyState ?? null,
        }
      : null,
  };
}
