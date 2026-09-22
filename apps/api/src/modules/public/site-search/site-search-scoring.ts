/**
 * Score a free-text match against weighted fields.
 * Exact match keeps full weight; prefix / contains get small penalties.
 */
export function scoreSiteSearchTextMatch(
  query: string,
  fields: ReadonlyArray<{ weight: number; value: string | null | undefined }>,
): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  let best = 0;
  for (const { weight, value } of fields) {
    if (!value) continue;
    const haystack = value.trim().toLowerCase();
    if (!haystack) continue;

    if (haystack === q) {
      best = Math.max(best, weight);
    } else if (haystack.startsWith(q)) {
      best = Math.max(best, Math.max(1, weight - 5));
    } else if (haystack.includes(q)) {
      best = Math.max(best, Math.max(1, weight - 15));
    }
  }
  return best;
}

/** Field weights for accommodation catalogue search. */
export const HOTEL_SITE_SEARCH_WEIGHTS = {
  name: 100,
  slug: 80,
  destination: 60,
  address: 50,
  description: 40,
} as const;
