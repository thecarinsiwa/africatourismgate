export type TravelDurationLabels = {
  hourSingular: string;
  hourPlural: string;
  minuteSingular: string;
  minutePlural: string;
};

export type TravelRouteStatsLabels = {
  durationLabel: string | null;
  distanceLabel: string | null;
};

/**
 * Format OSRM duration (seconds) for map UI.
 * Rounds to the nearest minute; returns null if under 30s.
 */
export function formatTravelDurationSeconds(
  durationSeconds: number | null | undefined,
  labels: TravelDurationLabels,
): string | null {
  if (durationSeconds == null || !Number.isFinite(durationSeconds) || durationSeconds < 30) {
    return null;
  }

  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(
      hours === 1
        ? labels.hourSingular
        : labels.hourPlural.replace('{n}', String(hours)),
    );
  }
  if (mins > 0) {
    parts.push(
      mins === 1
        ? labels.minuteSingular
        : labels.minutePlural.replace('{n}', String(mins)),
    );
  }

  return parts.join(' ') || null;
}

/**
 * Format OSRM distance (meters) as kilometers for map UI.
 * Returns null if under ~50 m.
 */
export function formatTravelDistanceMeters(
  distanceMeters: number | null | undefined,
): string | null {
  if (distanceMeters == null || !Number.isFinite(distanceMeters) || distanceMeters < 50) {
    return null;
  }

  const km = distanceMeters / 1000;
  if (km < 10) {
    const rounded = Math.round(km * 10) / 10;
    return `${Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/** Join duration + distance for the map badge, e.g. "33 min · 24 km". */
export function formatTravelRouteBadge(
  stats: TravelRouteStatsLabels,
): string | null {
  const parts = [stats.durationLabel, stats.distanceLabel].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length ? parts.join(' · ') : null;
}
