export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorFirstName: string | null;
  createdAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface AdminReviewListItem {
  id: string;
  rating: number;
  status: ReviewStatus;
  createdAt: string;
  authorFirstName: string | null;
  authorEmail: string | null;
  entityType: string;
  entityId: string;
  propertyId: string | null;
  propertyName: string | null;
  /** Populated for tour_guide reviews. */
  guideName?: string | null;
  guideId?: string | null;
  bookingId?: string | null;
  title: string | null;
  body: string | null;
}

export interface AdminReviewDetail extends AdminReviewListItem {
  userId: string;
  updatedAt: string | null;
}

export interface ReviewsListQuery {
  page?: number;
  limit?: number;
  rating?: number;
  status?: ReviewStatus;
  propertyId?: string;
}

export interface UpdateReviewStatusRequest {
  status: 'approved' | 'hidden';
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

export type ReviewEntityType =
  | 'property'
  | 'flight'
  | 'vehicle'
  | 'cruise'
  | 'activity'
  | 'booking'
  | 'tour_guide';

export interface GuideReviewInvite {
  assignmentId: string;
  guideId: string;
  guideName: string;
  role: 'primary' | 'secondary';
  canReview: boolean;
  review: Review | null;
}

export interface PublicFeaturedReviewsListQuery {
  limit?: number;
}

export interface PropertyReviewsListQuery {
  page?: number;
  limit?: number;
}
