export interface ActivityProvider {
  id: string;
  destinationId: string;
  name: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** Public catalogue partner (home partners strip / listing). */
export interface PublicActivityProvider {
  id: string;
  name: string;
  logoUrl: string | null;
}

/** Partners directory row: provider + destination and catalogue summary. */
export interface PublicActivityProviderListItem extends PublicActivityProvider {
  destinationName?: string | null;
  countryCode?: string | null;
  activitiesCount?: number;
  averageRating?: number | null;
  reviewCount?: number;
}

export interface CreateActivityProviderRequest {
  destinationId: string;
  name: string;
  logoUrl?: string | null;
}

export type UpdateActivityProviderRequest = Partial<CreateActivityProviderRequest>;

export interface ActivityProvidersListQuery {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
}

export const ACTIVITY_DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'hard',
  'expert',
] as const;

export type ActivityDifficultyLevel = (typeof ACTIVITY_DIFFICULTY_LEVELS)[number];

export const ACTIVITY_BOOKING_REQUEST_STATUSES = [
  'pending',
  'contacted',
  'confirmed',
  'cancelled',
] as const;

export type ActivityBookingRequestStatus =
  (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];

/**
 * Activity card fields returned by public browse/search
 * and nested under partner detail.
 */
export interface PublicActivityListItem {
  id: string;
  title: string;
  durationMinutes: number | null;
  priceCents: number;
  currency: string;
  destination: string;
  latitude?: number | null;
  longitude?: number | null;
  providerName: string;
  availableSchedulesCount: number;
  nextStartDatetime?: string;
  imageUrl?: string | null;
  difficultyLevel?: ActivityDifficultyLevel | null;
  /** When true and no slots remain, show the public booking-request form. */
  allowBookingRequestsWhenUnavailable?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
}

/** Public partner detail page payload. */
export interface PublicActivityProviderDetail extends PublicActivityProvider {
  destinationId: string;
  destinationName: string;
  activities: PublicActivityListItem[];
}

export interface Activity {
  id: string;
  providerId: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  difficultyLevel: ActivityDifficultyLevel | null;
  priceCents: number;
  currency: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  /** NULL = catalogue partagé (toutes orgs). */
  organizationId: string | null;
  /** When true, visitors can submit an inquiry if no slots are available. */
  allowBookingRequestsWhenUnavailable: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityRequest {
  providerId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  difficultyLevel?: ActivityDifficultyLevel | null;
  priceCents: number;
  currency: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  organizationId?: string | null;
  allowBookingRequestsWhenUnavailable?: boolean;
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

/** Public inquiry submitted when an activity has no bookable slots. */
export interface ActivityBookingRequest {
  id: string;
  activityId: string;
  organizationId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  preferredDate: string;
  participants: number;
  message: string | null;
  status: ActivityBookingRequestStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityBookingRequestPayload {
  fullName: string;
  email: string;
  phone?: string | null;
  preferredDate: string;
  participants: number;
  message?: string | null;
}

export interface CreateActivityBookingRequestResponse {
  id: string;
  message: string;
}

export interface ActivityBookingRequestsListQuery {
  page?: number;
  limit?: number;
  activityId?: string;
  organizationId?: string;
  status?: ActivityBookingRequestStatus;
  search?: string;
}

export interface UpdateActivityBookingRequestStatusRequest {
  status: ActivityBookingRequestStatus;
}

export type ActivityBookingRequestAvailability =
  | 'available'
  | 'unavailable'
  | 'in_progress'
  | 'pending_review';

export interface ActivityBookingRequestStatusEmailPreviewRequest {
  status: ActivityBookingRequestStatus;
}

export interface ActivityBookingRequestStatusEmailPreview {
  subject: string;
  html: string;
  text: string;
  availability: ActivityBookingRequestAvailability;
  status: ActivityBookingRequestStatus;
}

export interface ActivitiesListQuery {
  page?: number;
  limit?: number;
  search?: string;
  providerId?: string;
  destinationId?: string;
  organizationId?: string;
}

export interface ActivitySchedule {
  id: string;
  activityId: string;
  startDatetime: string;
  capacity: number;
  bookedCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityScheduleRequest {
  activityId: string;
  startDatetime: string;
  capacity: number;
}

export type UpdateActivityScheduleRequest = Partial<
  Omit<CreateActivityScheduleRequest, 'activityId'>
>;

export interface ActivitySchedulesListQuery {
  page?: number;
  limit?: number;
  activityId?: string;
  destinationId?: string;
}

export interface ActivityImage {
  id: string;
  activityId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityImageRequest {
  activityId: string;
  url: string;
  caption?: string;
  sortOrder?: number;
}

export type UpdateActivityImageRequest = Partial<
  Omit<CreateActivityImageRequest, 'activityId'>
>;

export interface ActivityImagesListQuery {
  page?: number;
  limit?: number;
  activityId?: string;
}

export type ActivityDescriptionAssetType = 'image' | 'pdf' | 'word';

export interface ActivityDescriptionAsset {
  id: string;
  activityId: string;
  assetType: ActivityDescriptionAssetType;
  url: string;
  name: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateActivityDescriptionAssetRequest {
  activityId: string;
  assetType: ActivityDescriptionAssetType;
  url: string;
  name?: string;
  sortOrder?: number;
}

export type UpdateActivityDescriptionAssetRequest = Partial<
  Omit<CreateActivityDescriptionAssetRequest, 'activityId'>
>;

export interface ActivityDescriptionAssetsListQuery {
  page?: number;
  limit?: number;
  activityId?: string;
  assetType?: ActivityDescriptionAssetType;
}

export interface ActivityDescriptionAssetUploadResponse {
  url: string;
  assetType: ActivityDescriptionAssetType;
}
