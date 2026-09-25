'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { PublicDestination } from '@africatourismgate/types';
import {
  browseActivities,
  listPublicDestinations,
  searchAccommodations,
} from '../../lib/api/public';
import { siteSearchDeepLinks } from '../../lib/site-search/deep-links';
import { useScrollAnimation } from './use-scroll-animation';
import { Spinner } from '@africatourismgate/ui';

const DestinationsMapInner = dynamic(
  () => import('./destinations-map-inner').then((m) => m.DestinationsMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[min(52vh,320px)] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[420px] lg:h-[520px]" />
    ),
  },
);

const MAP_HEIGHT_CLASS =
  'h-[min(52vh,320px)] w-full sm:h-[420px] lg:h-[520px]';

export type DestinationMapMarkerKind = 'destination' | 'hotel' | 'activity';

export type DestinationMapMarker = {
  id: string;
  kind: DestinationMapMarkerKind;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  href: string;
  viewLabel: string;
  fillColor: string;
  /** Short product-type label shown on the map popup / legend. */
  kindLabel?: string;
};

const DESTINATION_COLOR = 'var(--atg-primary, #c8102e)';
const HOTEL_COLOR = '#0f766e';
const ACTIVITY_COLOR = '#b45309';

function formatCountryName(countryCode: string, locale: string): string {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    return displayNames.of(countryCode) ?? countryCode;
  } catch {
    return countryCode;
  }
}

function hasMapCoordinates(
  destination: PublicDestination,
): destination is PublicDestination & {
  latitude: number;
  longitude: number;
} {
  return (
    typeof destination.latitude === 'number' &&
    Number.isFinite(destination.latitude) &&
    typeof destination.longitude === 'number' &&
    Number.isFinite(destination.longitude)
  );
}

/** Spread product pins around a destination center when product coords are missing. */
function offsetAround(
  latitude: number,
  longitude: number,
  index: number,
  total: number,
): { latitude: number; longitude: number } {
  if (total <= 1) {
    return { latitude, longitude };
  }

  const radiusDeg = 0.035 + Math.floor(index / 8) * 0.012;
  const angle = (2 * Math.PI * index) / Math.max(total, 1) - Math.PI / 2;
  const latRad = (latitude * Math.PI) / 180;

  return {
    latitude: latitude + radiusDeg * Math.cos(angle),
    longitude: longitude + (radiusDeg * Math.sin(angle)) / Math.cos(latRad),
  };
}

function hasProductCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  );
}

function formatPriceLabel(priceCents: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(priceCents / 100);
  } catch {
    return `${Math.round(priceCents / 100)} ${currency}`;
  }
}

function activityHref(
  id: string,
  destinationName: string,
  nextStartDatetime?: string,
): string {
  if (nextStartDatetime) {
    const date = nextStartDatetime.slice(0, 10);
    return siteSearchDeepLinks.activity(id, {
      destination: destinationName,
      date,
      participants: 1,
    });
  }
  return siteSearchDeepLinks.activitiesByDestination(destinationName);
}

export function DestinationsMapSection() {
  const t = useTranslations('activitiesMap');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [destinations, setDestinations] = useState<PublicDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(
    null,
  );
  const [productMarkers, setProductMarkers] = useState<DestinationMapMarker[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void listPublicDestinations()
      .then((rows) => {
        if (!cancelled) {
          setDestinations(rows);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const viewDestinationLabel = t('viewDestination');
  const viewHotelLabel = t('viewHotel');
  const viewActivityLabel = t('viewActivity');
  const hotelKindLabel = t('hotelKind');
  const activityKindLabel = t('activityKind');
  const destinationKindLabel = t('destinationKind');

  const destinationMarkers = useMemo<DestinationMapMarker[]>(() => {
    return destinations.filter(hasMapCoordinates).map((destination) => ({
      id: destination.id,
      kind: 'destination' as const,
      title: destination.name,
      subtitle: formatCountryName(destination.countryCode, locale),
      latitude: destination.latitude,
      longitude: destination.longitude,
      href: siteSearchDeepLinks.hotelsByDestination(destination.name),
      viewLabel: viewDestinationLabel,
      fillColor: DESTINATION_COLOR,
      kindLabel: destinationKindLabel,
    }));
  }, [destinationKindLabel, destinations, locale, viewDestinationLabel]);

  const selectedDestination = useMemo(() => {
    if (!selectedDestinationId) {
      return null;
    }
    return destinationMarkers.find((m) => m.id === selectedDestinationId) ?? null;
  }, [destinationMarkers, selectedDestinationId]);

  const loadProductsForDestination = useCallback(
    async (destination: DestinationMapMarker) => {
      setProductsLoading(true);
      setProductsError(false);
      setProductMarkers([]);

      try {
        const [hotelsResult, activitiesResult] = await Promise.all([
          searchAccommodations({
            destinationId: destination.id,
            limit: 40,
          }),
          browseActivities({
            destination: destination.title,
            limit: 40,
          }),
        ]);

        const hotels = hotelsResult.data ?? [];
        const activities = activitiesResult.data ?? [];
        const total = hotels.length + activities.length;
        let fallbackIndex = 0;
        const next: DestinationMapMarker[] = [];

        for (const hotel of hotels) {
          const point = hasProductCoordinates(hotel.latitude, hotel.longitude)
            ? { latitude: hotel.latitude, longitude: hotel.longitude! }
            : offsetAround(
                destination.latitude,
                destination.longitude,
                fallbackIndex++,
                total,
              );
          next.push({
            id: `hotel-${hotel.id}`,
            kind: 'hotel',
            title: hotel.name,
            subtitle: `${hotelKindLabel} · ${formatPriceLabel(hotel.minPriceCents, hotel.currency, locale)}`,
            latitude: point.latitude,
            longitude: point.longitude,
            href: siteSearchDeepLinks.hotel(hotel.id),
            viewLabel: viewHotelLabel,
            fillColor: HOTEL_COLOR,
            kindLabel: hotelKindLabel,
          });
        }

        for (const activity of activities) {
          const point = hasProductCoordinates(activity.latitude, activity.longitude)
            ? { latitude: activity.latitude, longitude: activity.longitude! }
            : offsetAround(
                destination.latitude,
                destination.longitude,
                fallbackIndex++,
                total,
              );
          next.push({
            id: `activity-${activity.id}`,
            kind: 'activity',
            title: activity.title,
            subtitle: `${activityKindLabel} · ${formatPriceLabel(activity.priceCents, activity.currency, locale)}`,
            latitude: point.latitude,
            longitude: point.longitude,
            href: activityHref(
              activity.id,
              destination.title,
              activity.nextStartDatetime,
            ),
            viewLabel: viewActivityLabel,
            fillColor: ACTIVITY_COLOR,
            kindLabel: activityKindLabel,
          });
        }

        setProductMarkers(next);
      } catch {
        setProductsError(true);
        setProductMarkers([]);
      } finally {
        setProductsLoading(false);
      }
    },
    [
      activityKindLabel,
      hotelKindLabel,
      locale,
      viewActivityLabel,
      viewHotelLabel,
    ],
  );

  const handleDestinationClick = useCallback(
    (marker: DestinationMapMarker) => {
      if (marker.kind !== 'destination') {
        return;
      }
      setSelectedDestinationId(marker.id);
      void loadProductsForDestination(marker);
    },
    [loadProductsForDestination],
  );

  const handleResetView = useCallback(() => {
    setSelectedDestinationId(null);
    setProductMarkers([]);
    setProductsError(false);
    setProductsLoading(false);
  }, []);

  const markers = useMemo(() => {
    if (!selectedDestination) {
      return destinationMarkers;
    }
    // Once products are on the map, show product-type pins only.
    if (productMarkers.length > 0) {
      return productMarkers;
    }
    return [
      {
        ...selectedDestination,
        fillColor: DESTINATION_COLOR,
        kindLabel: destinationKindLabel,
      },
    ];
  }, [
    destinationKindLabel,
    destinationMarkers,
    productMarkers,
    selectedDestination,
  ]);

  const productsReady =
    Boolean(selectedDestination) && !productsLoading && productMarkers.length > 0;

  const focus = useMemo(() => {
    if (!selectedDestination || productsReady) {
      return null;
    }
    return {
      latitude: selectedDestination.latitude,
      longitude: selectedDestination.longitude,
      zoom: 11,
    };
  }, [productsReady, selectedDestination]);

  return (
    <section
      id="gallery"
      ref={ref}
      className="scroll-mt-24 border-y border-atg-border bg-atg-elevated py-16 transition-colors dark:border-atg-border dark:bg-atg-elevated sm:py-20"
      aria-labelledby="destinations-map-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-10 max-w-2xl mx-auto text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <h2
            id="destinations-map-heading"
            className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl"
          >
            {t('title')}
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-atg-muted">
            {t('subtitle')}
          </p>
        </div>

        <div className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {loading ? (
            <div
              className={`flex ${MAP_HEIGHT_CLASS} flex-col items-center justify-center gap-3 rounded-xl border border-atg-border bg-atg-surface`}
              role="status"
              aria-busy="true"
              aria-label={t('loading')}
            >
              <Spinner size="lg" variant="primary" label={t('loading')} showLabel />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-atg-muted" role="alert">
              {t('loadError')}
            </p>
          ) : destinationMarkers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-atg-border bg-atg-surface px-6 py-16 text-center">
              <p className="text-sm text-atg-muted">{t('empty')}</p>
              <Link
                href="/hotels"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                {t('browseAll')}
              </Link>
            </div>
          ) : (
            <div className="relative z-0 isolate overflow-hidden rounded-xl border border-atg-border shadow-md">
              <DestinationsMapInner
                markers={markers}
                ariaLabel={t('mapAria')}
                focus={focus}
                fitToMarkers={!selectedDestination || productsReady}
                fitMaxZoom={selectedDestination ? 13 : 8}
                onDestinationClick={handleDestinationClick}
                className={MAP_HEIGHT_CLASS}
              />

              {selectedDestination ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-col gap-2 p-2.5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3 sm:p-4">
                  <div className="pointer-events-auto min-w-0 max-w-full rounded-lg border border-atg-border bg-white px-3 py-2 shadow-lg sm:max-w-[min(100%,20rem)] sm:px-3.5 sm:py-2.5 dark:bg-zinc-900">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {selectedDestination.title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      {productsLoading
                        ? t('loadingProducts')
                        : productsError
                          ? t('productsError')
                          : productMarkers.length === 0
                            ? t('noProducts')
                            : t('productsCount', { count: productMarkers.length })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="pointer-events-auto w-full shrink-0 rounded-lg border border-atg-border bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-lg hover:bg-zinc-50 sm:w-auto sm:px-3.5 sm:py-2.5 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                  >
                    {t('showAllDestinations')}
                  </button>
                </div>
              ) : null}

              {selectedDestination && productMarkers.length > 0 ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex justify-center p-2.5 sm:justify-start sm:p-4">
                  <ul
                    className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-lg border border-atg-border bg-white px-2.5 py-2 text-[11px] font-medium text-zinc-800 shadow-lg sm:justify-start sm:px-3.5 sm:py-2.5 sm:text-xs dark:bg-zinc-900 dark:text-zinc-100"
                    aria-label={t('legendAria')}
                  >
                    <li className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white shadow ring-2 ring-white sm:h-6 sm:w-6"
                        style={{ backgroundColor: HOTEL_COLOR }}
                        aria-hidden
                      >
                        <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21h18" />
                          <path d="M5 21V8l7-4 7 4v13" />
                          <path d="M9 21v-5h6v5" />
                        </svg>
                      </span>
                      {hotelKindLabel}
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white shadow ring-2 ring-white sm:h-6 sm:w-6"
                        style={{ backgroundColor: ACTIVITY_COLOR }}
                        aria-hidden
                      >
                        <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                        </svg>
                      </span>
                      {activityKindLabel}
                    </li>
                  </ul>
                </div>
              ) : null}

              {productsLoading ? (
                <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center bg-white/30 px-3 dark:bg-zinc-950/30">
                  <div className="max-w-[min(100%,18rem)] rounded-lg border border-atg-border bg-white px-3 py-2.5 shadow-lg dark:bg-zinc-900">
                    <Spinner size="md" variant="primary" label={t('loadingProducts')} showLabel />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
