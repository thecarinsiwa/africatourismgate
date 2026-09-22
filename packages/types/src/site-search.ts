/** Catalogue types searchable via GET /public/site-search. */
export const SITE_SEARCH_HIT_TYPES = [
  'hotels',
  'flights',
  'cars',
  'cruises',
  'activities',
  'packages',
  'blog',
] as const;

export type SiteSearchHitType = (typeof SITE_SEARCH_HIT_TYPES)[number];

/** Default max hits returned per catalogue type. */
export const SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE = 5;

/** Hard cap on `limit` query param (per type). */
export const SITE_SEARCH_MAX_LIMIT_PER_TYPE = 20;

/** Minimum trimmed query length before catalogue search runs. */
export const SITE_SEARCH_MIN_QUERY_LENGTH = 2;

/** Maximum accepted query length. */
export const SITE_SEARCH_MAX_QUERY_LENGTH = 180;

export interface PublicSiteSearchQuery {
  /** Free-text query (trimmed server-side). */
  q: string;
  /** Locale for locale-aware sources (e.g. blog). */
  locale?: string;
  /** Max hits per type (default 5, max 20). */
  limit?: number;
  /** Optional subset of catalogue types; omit = all. */
  types?: SiteSearchHitType[];
}

export interface PublicSiteSearchHit {
  type: SiteSearchHitType;
  /** Entity id (UUID) or blog slug. */
  id: string;
  title: string;
  subtitle?: string | null;
  /** Absolute path on the public web app (e.g. `/hotels/{id}`). */
  href: string;
  imageUrl?: string | null;
  /** Higher = better match (title match > description, etc.). */
  score: number;
}

export interface PublicSiteSearchGroup {
  type: SiteSearchHitType;
  hits: PublicSiteSearchHit[];
  /** Partial failure for this type; other groups may still succeed. */
  error?: string | null;
}

export interface PublicSiteSearchResponse {
  query: string;
  locale: string | null;
  limit: number;
  types: SiteSearchHitType[];
  groups: PublicSiteSearchGroup[];
}
