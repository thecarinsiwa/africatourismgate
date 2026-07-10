'use client';

import dynamic from 'next/dynamic';
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
};

export function ItineraryMapSection({
  points,
  ariaLabel,
  className,
  mapClassName,
}: ItineraryMapSectionProps) {
  if (!points.length) {
    return null;
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-atg-border shadow-sm">
        <ItineraryMapInner points={points} ariaLabel={ariaLabel} className={mapClassName} />
      </div>
    </div>
  );
}

export type { ItineraryMapPoint };
