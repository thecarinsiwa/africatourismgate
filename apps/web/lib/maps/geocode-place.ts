export type GeocodedPlace = {
  latitude: number;
  longitude: number;
  displayName: string;
};

type NominatimSearchItem = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

const memoryCache = new Map<string, GeocodedPlace | null>();

function cacheKey(query: string): string {
  return query.trim().toLowerCase();
}

function readSessionCache(key: string): GeocodedPlace | null | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(`atg-geocode:${key}`);
    if (raw == null) return undefined;
    if (raw === 'null') return null;
    const parsed = JSON.parse(raw) as GeocodedPlace;
    if (
      typeof parsed?.latitude !== 'number' ||
      typeof parsed?.longitude !== 'number' ||
      !Number.isFinite(parsed.latitude) ||
      !Number.isFinite(parsed.longitude)
    ) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function writeSessionCache(key: string, value: GeocodedPlace | null): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      `atg-geocode:${key}`,
      value == null ? 'null' : JSON.stringify(value),
    );
  } catch {
    // Quota / private mode — memory cache still applies.
  }
}

/**
 * Resolve a place name to coordinates via Nominatim (OpenStreetMap).
 * Cached in memory + sessionStorage to respect the 1 req/s public usage policy.
 */
export async function geocodePlace(
  query: string,
  options?: { signal?: AbortSignal },
): Promise<GeocodedPlace | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const key = cacheKey(trimmed);
  if (memoryCache.has(key)) {
    return memoryCache.get(key) ?? null;
  }

  const fromSession = readSessionCache(key);
  if (fromSession !== undefined) {
    memoryCache.set(key, fromSession);
    return fromSession;
  }

  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    q: trimmed,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      signal: options?.signal,
      headers: { Accept: 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error(`Nominatim ${response.status}`);
  }

  const results = (await response.json()) as NominatimSearchItem[];
  const first = results[0];
  const latitude = first?.lat != null ? Number(first.lat) : NaN;
  const longitude = first?.lon != null ? Number(first.lon) : NaN;

  const place: GeocodedPlace | null =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? {
          latitude,
          longitude,
          displayName: first?.display_name?.trim() || trimmed,
        }
      : null;

  memoryCache.set(key, place);
  writeSessionCache(key, place);
  return place;
}
