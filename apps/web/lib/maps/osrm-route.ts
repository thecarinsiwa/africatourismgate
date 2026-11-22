import type { ItineraryMapPoint } from './types';

export type LatLngTuple = [number, number];

export type OsrmDrivingRoute = {
  path: LatLngTuple[];
  /** Driving duration in seconds (OSRM). */
  durationSeconds: number;
  /** Driving distance in meters (OSRM). */
  distanceMeters: number;
};

const DEFAULT_OSRM_BASE = 'https://router.project-osrm.org';

type OsrmRouteResponse = {
  code?: string;
  routes?: Array<{
    duration?: number;
    distance?: number;
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
 * Returns path + duration/distance, or `null` on failure.
 * Does not take an AbortSignal - callers ignore stale results with a generation flag
 * (public OSRM can take 10–30s; aborting on React Strict Mode remounts was dropping routes).
 */
export async function fetchOsrmDrivingRoute(
  points: ItineraryMapPoint[],
): Promise<OsrmDrivingRoute | null> {
  if (points.length < 2) return null;

  const coords = points
    .map((p) => `${p.longitude},${p.latitude}`)
    .join(';');

  const url =
    `${getOsrmBaseUrl()}/route/v1/driving/${coords}` +
    '?overview=full&geometries=geojson';

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as OsrmRouteResponse;
    const route = data.routes?.[0];
    if (
      data.code !== 'Ok' ||
      !route?.geometry?.coordinates?.length ||
      typeof route.duration !== 'number' ||
      !Number.isFinite(route.duration)
    ) {
      return null;
    }

    // GeoJSON is [lng, lat] → Leaflet wants [lat, lng]
    return {
      path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      durationSeconds: route.duration,
      distanceMeters:
        typeof route.distance === 'number' && Number.isFinite(route.distance)
          ? route.distance
          : 0,
    };
  } catch {
    return null;
  }
}

export function straightLineLatLngs(points: ItineraryMapPoint[]): LatLngTuple[] {
  return points.map((p) => [p.latitude, p.longitude]);
}
