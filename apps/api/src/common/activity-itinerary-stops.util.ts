export type ActivityItineraryStopDurationInput = {
  stopOrder: number;
  durationMinutes?: number | null;
};

export function filterActivityItineraryStopsByDuration<T extends ActivityItineraryStopDurationInput>(
  stops: T[],
  activityDurationMinutes: number | null | undefined,
): T[] {
  const sorted = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);

  if (activityDurationMinutes == null || activityDurationMinutes <= 0) {
    return sorted;
  }

  const hasTimedSegments = sorted.some(
    (stop) => stop.durationMinutes != null && stop.durationMinutes > 0,
  );
  if (!hasTimedSegments) {
    return sorted;
  }

  let elapsed = 0;
  const included: T[] = [];

  for (const stop of sorted) {
    const segment = stop.durationMinutes;
    if (segment == null || segment <= 0) {
      included.push(stop);
      continue;
    }

    if (elapsed + segment <= activityDurationMinutes) {
      included.push(stop);
      elapsed += segment;
      continue;
    }

    break;
  }

  return included;
}

export function sumActivityItineraryStopDurations(
  stops: ActivityItineraryStopDurationInput[],
): number {
  return stops.reduce((total, stop) => {
    if (stop.durationMinutes == null || stop.durationMinutes <= 0) {
      return total;
    }
    return total + stop.durationMinutes;
  }, 0);
}
