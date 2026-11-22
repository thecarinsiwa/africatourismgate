'use client';

import dynamic from 'next/dynamic';
import type {
  TravelDurationLabels,
  TravelRouteStatsLabels,
} from '../../lib/maps/travel-duration';
import type { ItineraryMapPoint } from '../../lib/maps/types';

const ItineraryMapInner = dynamic(
  () => import('./itinerary-map-inner').then((m) => m.ItineraryMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[400px]" />
    ),
  },
);

type ItineraryMapSectionProps = {
  points: ItineraryMapPoint[];
  ariaLabel: string;
  className?: string;
  mapClassName?: string;
  /** When set, shows estimated driving time / distance on the route polyline. */
  durationLabels?: TravelDurationLabels;
  onRouteStatsChange?: (stats: TravelRouteStatsLabels | null) => void;
};

export function ItineraryMapSection({
  points,
  ariaLabel,
  className,
  mapClassName,
  durationLabels,
  onRouteStatsChange,
}: ItineraryMapSectionProps) {
  if (!points.length) {
    return null;
  }

  return (
    <div className={className}>
      <div className="relative z-0 isolate overflow-hidden rounded-xl border border-atg-border shadow-sm">
        <ItineraryMapInner
          points={points}
          ariaLabel={ariaLabel}
          className={mapClassName}
          durationLabels={durationLabels}
          onRouteStatsChange={onRouteStatsChange}
        />
      </div>
    </div>
  );
}

export type { ItineraryMapPoint };
