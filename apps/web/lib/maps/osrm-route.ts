import type { ItineraryMapPoint } from './types';

export type LatLngTuple = [number, number];

const DEFAULT_OSRM_BASE = 'https://router.project-osrm.org';

type OsrmRouteResponse = {
  code?: string;
  routes?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
};

/** OSRM base URL (no trailing slash). Override with NEXT_PUBLIC_OSRM_URL for self-host. */
export function getOsrmBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_OSRM_URL?.trim();
  if (!raw) return DEFAULT_OSRM_BASE;
  return raw.replace(/\/$/, '');
}

/**
 * Fetch a driving route through waypoints via OSRM.
 * Returns `[lat, lng][]` suitable for Leaflet, or `null` on failure.
 */
export async function fetchOsrmDrivingRoute(
  points: ItineraryMapPoint[],
  signal?: AbortSignal,
): Promise<LatLngTuple[] | null> {
  if (points.length < 2) return null;

  const coords = points
    .map((p) => `${p.longitude},${p.latitude}`)
    .join(';');

  const url =
    `${getOsrmBaseUrl()}/route/v1/driving/${coords}` +
    '?overview=full&geometries=geojson';

  try {
    const response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as OsrmRouteResponse;
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates?.length) {
      return null;
    }

    // GeoJSON is [lng, lat] → Leaflet wants [lat, lng]
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}

export function straightLineLatLngs(points: ItineraryMapPoint[]): LatLngTuple[] {
  return points.map((p) => [p.latitude, p.longitude]);
}
