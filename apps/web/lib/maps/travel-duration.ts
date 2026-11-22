export type TravelDurationLabels = {
  hourSingular: string;
  hourPlural: string;
  minuteSingular: string;
  minutePlural: string;
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
