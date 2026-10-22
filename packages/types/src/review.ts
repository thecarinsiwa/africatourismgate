export type ReviewSource = 'platform' | 'tripadvisor';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorFirstName: string | null;
  /** Reviewer profile photo when available (platform reviews only). */
  authorAvatarUrl?: string | null;
  /** Origin of the review — drives homepage badges and filtering. */
  source: ReviewSource;
  createdAt: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export interface AdminReviewListItem {
  id: string;
  rating: number;
  status: ReviewStatus;
  source: ReviewSource;
  createdAt: string;
  authorFirstName: string | null;
  authorEmail: string | null;
  /** Display name for Tripadvisor (or other external) reviews. */
  externalAuthorName: string | null;
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
  /** Null for Tripadvisor / external reviews. */
  userId: string | null;
  updatedAt: string | null;
}

export interface ReviewsListQuery {
  page?: number;
  limit?: number;
  rating?: number;
  status?: ReviewStatus;
  source?: ReviewSource;
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

/** Admin Contenu › Avis — manual Tripadvisor review for the homepage carousel. */
export interface CreateAdminTripadvisorReviewRequest {
  rating: number;
  title?: string;
  /** Required non-empty review text. */
  body: string;
  /** Display name shown on the public site. */
  authorName: string;
  /** Defaults to `approved` so the review can appear on the homepage immediately. */
  status?: ReviewStatus;
}

/** Result of `POST /reviews/tripadvisor/sync` (Terra location reviews import). */
export interface SyncTripadvisorReviewsResult {
  imported: number;
  updated: number;
  skipped: number;
  pages: number;
}

export type ReviewEntityType =
  | 'property'
  | 'flight'
  | 'vehicle'
  | 'cruise'
  | 'activity'
  | 'booking'
  | 'tour_guide'
  | 'tripadvisor';

export interface GuideReviewInvite {
  assignmentId: string;
  guideId: string;
  guideName: string;
  guideBio: string | null;
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

export const REVIEW_SOURCES = ['platform', 'tripadvisor'] as const satisfies readonly ReviewSource[];
