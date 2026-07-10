'use client';

import { useMemo } from 'react';
import type { PackageItemType, PackageMapPoint } from '../../lib/packages/types';
import { ItineraryMapSection } from '../maps/itinerary-map-section';
import { PackageItemTypeIcon } from './package-item-type-icon';

type PackageItineraryMapLabels = {
  itineraryMapTitle: string;
  itineraryMapAria: string;
  itineraryMapLegendTitle: string;
  itineraryMapLegendPoints: string;
  itineraryMapPartialHint: string;
  itemTypes: Record<PackageItemType, string>;
};

type PackageItineraryMapSectionProps = {
  mapPoints: PackageMapPoint[];
  packageItemTypes: PackageItemType[];
  labels: PackageItineraryMapLabels;
};

const GEO_LIMITED_TYPES: PackageItemType[] = ['vehicle', 'cruise'];

export function PackageItineraryMapSection({
  mapPoints,
  packageItemTypes,
  labels,
}: PackageItineraryMapSectionProps) {
  const points = useMemo(
    () =>
      mapPoints.map((point, index) => ({
        id: `${point.itemId}-${index}`,
        label: point.label,
        latitude: point.latitude,
        longitude: point.longitude,
      })),
    [mapPoints],
  );

  const legendEntries = useMemo((): Array<[PackageItemType, number]> => {
    const counts = new Map<PackageItemType, number>();
    for (const point of mapPoints) {
      counts.set(point.itemType, (counts.get(point.itemType) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [mapPoints]);

  const showPartialHint = useMemo(() => {
    const typesInPackage = new Set(packageItemTypes);
    const typesOnMap = new Set(mapPoints.map((point) => point.itemType));
    return GEO_LIMITED_TYPES.some(
      (itemType) => typesInPackage.has(itemType) && !typesOnMap.has(itemType),
    );
  }, [mapPoints, packageItemTypes]);

  if (!points.length) {
    return null;
  }

  return (
    <section aria-labelledby="package-itinerary-map-heading">
      <h2 id="package-itinerary-map-heading" className="mb-3 text-lg font-bold text-atg-fg">
        {labels.itineraryMapTitle}
      </h2>

      <ItineraryMapSection points={points} ariaLabel={labels.itineraryMapAria} />

      {legendEntries.length > 0 ? (
        <div className="mt-4 rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 dark:border-atg-border dark:bg-atg-elevated">
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {labels.itineraryMapLegendTitle}
          </p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {legendEntries.map(([itemType, count]) => (
              <li
                key={itemType}
                className="inline-flex items-center gap-2 rounded-full border border-atg-border bg-atg-surface px-3 py-1.5 text-xs font-medium text-atg-fg"
              >
                <PackageItemTypeIcon itemType={itemType} className="h-4 w-4 text-primary" />
                <span>{labels.itemTypes[itemType]}</span>
                <span className="text-atg-muted">
                  {labels.itineraryMapLegendPoints.replace('{count}', String(count))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showPartialHint ? (
        <p className="mt-3 text-sm text-atg-muted">{labels.itineraryMapPartialHint}</p>
      ) : null}
    </section>
  );
}
