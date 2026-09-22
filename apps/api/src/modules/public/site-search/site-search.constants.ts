import {
  SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE,
  SITE_SEARCH_HIT_TYPES,
  SITE_SEARCH_MAX_LIMIT_PER_TYPE,
  SITE_SEARCH_MAX_QUERY_LENGTH,
  SITE_SEARCH_MIN_QUERY_LENGTH,
  type SiteSearchHitType,
} from '@africatourismgate/types';

export {
  SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE,
  SITE_SEARCH_HIT_TYPES,
  SITE_SEARCH_MAX_LIMIT_PER_TYPE,
  SITE_SEARCH_MAX_QUERY_LENGTH,
  SITE_SEARCH_MIN_QUERY_LENGTH,
};

export const SITE_SEARCH_HIT_TYPE_SET = new Set<string>(SITE_SEARCH_HIT_TYPES);

export function isSiteSearchHitType(value: string): value is SiteSearchHitType {
  return SITE_SEARCH_HIT_TYPE_SET.has(value);
}

/**
 * Parse `types` query: comma-separated string, repeated params, or array.
 * Invalid entries are dropped; empty → undefined (caller uses all types).
 */
export function parseSiteSearchTypesQuery(
  value: unknown,
): SiteSearchHitType[] | undefined {
  if (value == null || value === '') return undefined;

  const raw = Array.isArray(value)
    ? value.flatMap((entry) => String(entry).split(','))
    : String(value).split(',');

  const parsed = raw
    .map((entry) => entry.trim())
    .filter((entry): entry is SiteSearchHitType => isSiteSearchHitType(entry));

  if (parsed.length === 0) return undefined;

  return [...new Set(parsed)];
}

/** Resolve requested types or default to the full catalogue. */
export function resolveSiteSearchTypes(
  types?: SiteSearchHitType[],
): SiteSearchHitType[] {
  if (!types || types.length === 0) {
    return [...SITE_SEARCH_HIT_TYPES];
  }
  return [...new Set(types)];
}

export function clampSiteSearchLimit(limit?: number): number {
  if (limit == null || Number.isNaN(limit)) {
    return SITE_SEARCH_DEFAULT_LIMIT_PER_TYPE;
  }
  return Math.min(
    SITE_SEARCH_MAX_LIMIT_PER_TYPE,
    Math.max(1, Math.floor(limit)),
  );
}
