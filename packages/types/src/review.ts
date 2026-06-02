export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorFirstName: string | null;
  createdAt: string;
}

export interface PropertyReviewSummary {
  averageRating: number | null;
  reviewCount: number;
}

export interface CreateBookingReviewRequest {
  rating: number;
  title?: string;
  body?: string;
}

export interface PropertyReviewsListQuery {
  page?: number;
  limit?: number;
}
