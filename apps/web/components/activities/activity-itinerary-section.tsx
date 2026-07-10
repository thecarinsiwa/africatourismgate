'use client';

import { useMemo } from 'react';
import type { ActivityItineraryStop } from '../../lib/activities/types';
import { formatDurationMinutes } from '../../lib/activities/listings';
import { ItineraryMapSection } from '../maps/itinerary-map-section';

type ActivityItineraryLabels = {
  itineraryTitle: string;
  itineraryMapAria: string;
  itineraryStopLabel: string;
  itineraryStopDuration: string;
  hourSingular: string;
  hourPlural: string;
  minuteSingular: string;
  minutePlural: string;
};

type ActivityItinerarySectionProps = {
  stops: ActivityItineraryStop[];
  labels: ActivityItineraryLabels;
};

export function ActivityItinerarySection({ stops, labels }: ActivityItinerarySectionProps) {
  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.stopOrder - b.stopOrder),
    [stops],
  );

  const mapPoints = useMemo(
    () =>
      sortedStops.map((stop) => ({
        id: stop.id,
        label: stop.name,
        latitude: stop.latitude,
        longitude: stop.longitude,
        description: stop.description,
      })),
    [sortedStops],
  );

  if (!sortedStops.length) {
    return null;
  }

  return (
    <section aria-labelledby="activity-itinerary-heading">
      <h2 id="activity-itinerary-heading" className="mb-3 text-lg font-bold text-atg-fg">
        {labels.itineraryTitle}
      </h2>

      <ItineraryMapSection points={mapPoints} ariaLabel={labels.itineraryMapAria} />

      <ol className="mt-4 space-y-3">
        {sortedStops.map((stop) => (
          <li
            key={stop.id}
            className="flex gap-3 rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 dark:border-atg-border dark:bg-atg-elevated"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
              aria-hidden
            >
              {stop.stopOrder}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-atg-fg">{stop.name}</p>
              {stop.description ? (
                <p className="mt-1 text-sm leading-relaxed text-atg-muted">{stop.description}</p>
              ) : null}
              {stop.durationMinutes != null && stop.durationMinutes > 0 ? (
                <p className="mt-1 text-sm text-atg-muted">
                  {labels.itineraryStopDuration}:{' '}
                  {formatDurationMinutes(stop.durationMinutes, {
                    hourSingular: labels.hourSingular,
                    hourPlural: labels.hourPlural,
                    minuteSingular: labels.minuteSingular,
                    minutePlural: labels.minutePlural,
                  })}
                </p>
              ) : null}
              <p className="mt-1 font-mono text-xs tabular-nums text-atg-muted">
                {labels.itineraryStopLabel}: {Number(stop.latitude).toFixed(5)},{' '}
                {Number(stop.longitude).toFixed(5)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
