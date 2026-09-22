/**
 * Contour pays (GeoJSON) via Nominatim — même stack OSM que les cartes admin.
 * Cache mémoire par code ISO-2 pour limiter les appels.
 */

export type CountryBoundaryGeoJson = GeoJSON.GeoJsonObject;

type NominatimSearchItem = {
  geojson?: GeoJSON.GeoJsonObject;
  boundingbox?: [string, string, string, string];
};

const boundaryCache = new Map<string, CountryBoundaryGeoJson | null>();

export async function fetchCountryBoundaryGeoJson(
  countryCode: string,
  options?: { signal?: AbortSignal; countryName?: string },
): Promise<CountryBoundaryGeoJson | null> {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return null;
  }

  if (boundaryCache.has(code)) {
    return boundaryCache.get(code) ?? null;
  }

  const params = new URLSearchParams({
    format: 'json',
    polygon_geojson: '1',
    limit: '1',
    countrycodes: code.toLowerCase(),
    featureType: 'country',
  });
  const label = options?.countryName?.trim();
  params.set('q', label && label.length > 0 ? label : code);

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      signal: options?.signal,
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Nominatim ${response.status}`);
  }

  const results = (await response.json()) as NominatimSearchItem[];
  const geojson = results[0]?.geojson ?? null;
  boundaryCache.set(code, geojson);
  return geojson;
}
