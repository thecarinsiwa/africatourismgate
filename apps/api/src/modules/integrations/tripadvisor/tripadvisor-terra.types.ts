/** Subset of Terra `GET /locations/{id}/reviews` response (fields we consume). */

export interface TerraReviewUser {
  username?: string | null;
  name?: string | null;
  display_name?: string | null;
}

export interface TerraLocationReview {
  id?: string | number | null;
  rating?: number | string | null;
  title?: string | null;
  text?: string | null;
  published_date?: string | null;
  publish_ts?: string | null;
  published_at?: string | null;
  user?: TerraReviewUser | null;
}

export interface TerraReviewsPagination {
  page?: number;
  size?: number;
  total_pages?: number;
  total_elements?: number;
}

export interface TerraLocationReviewsResponse {
  data: TerraLocationReview[];
  pagination?: TerraReviewsPagination | null;
}

export interface FetchTerraLocationReviewsParams {
  apiKey: string;
  locationId: string;
  page: number;
  size: number;
  language: string;
}
