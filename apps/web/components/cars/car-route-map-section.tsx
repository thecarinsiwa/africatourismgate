'use client';

import { useEffect, useState } from 'react';
import { geocodePlace } from '../../lib/maps/geocode-place';
import type { ItineraryMapPoint } from '../../lib/maps/types';
import { ItineraryMapSection } from '../maps/itinerary-map-section';

type CarRouteMapLabels = {
  routeMapTitle: string;
  routeMapAria: string;
  routeMapDeparture: string;
  routeMapArrival: string;
};

type CarRouteMapSectionProps = {
  departureCity: string;
  arrivalCity: string;
  labels: CarRouteMapLabels;
};

export function CarRouteMapSection({
  departureCity,
  arrivalCity,
  labels,
}: CarRouteMapSectionProps) {
  const [points, setPoints] = useState<ItineraryMapPoint[] | null>(null);

  useEffect(() => {
    const departure = departureCity.trim();
    const arrival = arrivalCity.trim();
    if (!departure || !arrival) {
      setPoints([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    void (async () => {
      try {
        const departurePlace = await geocodePlace(departure, {
          signal: controller.signal,
        });
        // Public Nominatim policy: ≤ 1 request/second.
        await new Promise((resolve) => setTimeout(resolve, 1100));
        if (cancelled) return;

        const arrivalPlace = await geocodePlace(arrival, {
          signal: controller.signal,
        });
        if (cancelled) return;

        if (!departurePlace || !arrivalPlace) {
          setPoints([]);
          return;
        }

        setPoints([
          {
            id: 'departure',
            label: `${labels.routeMapDeparture}: ${departure}`,
            latitude: departurePlace.latitude,
            longitude: departurePlace.longitude,
            description: departurePlace.displayName,
          },
          {
            id: 'arrival',
            label: `${labels.routeMapArrival}: ${arrival}`,
            latitude: arrivalPlace.latitude,
            longitude: arrivalPlace.longitude,
            description: arrivalPlace.displayName,
          },
        ]);
      } catch {
        if (!cancelled) setPoints([]);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    departureCity,
    arrivalCity,
    labels.routeMapDeparture,
    labels.routeMapArrival,
  ]);

  if (points === null) {
    return (
      <section aria-labelledby="car-route-map-heading">
        <h2 id="car-route-map-heading" className="mb-3 text-lg font-bold text-atg-fg">
          {labels.routeMapTitle}
        </h2>
        <div className="h-[320px] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[400px]" />
      </section>
    );
  }

  if (!points.length) {
    return null;
  }

  return (
    <section aria-labelledby="car-route-map-heading">
      <h2 id="car-route-map-heading" className="mb-3 text-lg font-bold text-atg-fg">
        {labels.routeMapTitle}
      </h2>
      <ItineraryMapSection points={points} ariaLabel={labels.routeMapAria} />
    </section>
  );
}
