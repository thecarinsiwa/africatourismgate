'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
      <div className="h-[min(62vh,420px)] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[460px] lg:h-[540px]" />
    ),
  },
);

const MAP_HEIGHT_CLASS =
  'h-[min(62vh,420px)] w-full sm:h-[460px] lg:h-[540px]';

const PLACEHOLDER_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg/1280px-Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg';

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
  imageUrl?: string | null;
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
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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
            imageUrl: hotel.imageUrl,
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
            imageUrl: activity.imageUrl,
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
      setActiveProductId(null);
      void loadProductsForDestination(marker);
    },
    [loadProductsForDestination],
  );

  const handleResetView = useCallback(() => {
    setSelectedDestinationId(null);
    setProductMarkers([]);
    setProductsError(false);
    setProductsLoading(false);
    setActiveProductId(null);
  }, []);

  const handleProductSelect = useCallback((productId: string) => {
    setActiveProductId(productId);
    const card = carouselRef.current?.querySelector<HTMLElement>(
      `[data-product-id="${CSS.escape(productId)}"]`,
    );
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, []);

  const handleMarkerProductClick = useCallback(
    (marker: DestinationMapMarker) => {
      if (marker.kind === 'destination') {
        handleDestinationClick(marker);
        return;
      }
      handleProductSelect(marker.id);
    },
    [handleDestinationClick, handleProductSelect],
  );

  const productFocus = useMemo(() => {
    if (!activeProductId) {
      return null;
    }
    const product = productMarkers.find((item) => item.id === activeProductId);
    if (!product) {
      return null;
    }
    return {
      latitude: product.latitude,
      longitude: product.longitude,
      zoom: 15,
      markerId: product.id,
    };
  }, [activeProductId, productMarkers]);

  const seeMoreHref = selectedDestination
    ? siteSearchDeepLinks.hotelsByDestination(selectedDestination.title)
    : '/hotels';

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
                focus={productFocus ?? focus}
                fitToMarkers={!selectedDestination || (productsReady && !productFocus)}
                fitMaxZoom={selectedDestination ? 13 : 8}
                onDestinationClick={handleMarkerProductClick}
                highlightId={activeProductId}
                className={MAP_HEIGHT_CLASS}
              />

              {selectedDestination ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-2 sm:p-3">
                  <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-atg-border bg-white/95 py-1.5 pl-1.5 pr-3 shadow-md backdrop-blur-md dark:bg-zinc-900/95 sm:max-w-md">
                    <button
                      type="button"
                      onClick={handleResetView}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      aria-label={t('showAllDestinations')}
                      title={t('showAllDestinations')}
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-sm">
                        {selectedDestination.title}
                      </p>
                      <p className="truncate text-[10px] font-medium leading-tight text-zinc-500 dark:text-zinc-400 sm:text-xs">
                        {productsLoading
                          ? t('loadingProducts')
                          : productsError
                            ? t('productsError')
                            : productMarkers.length === 0
                              ? t('noProducts')
                              : t('productsCount', { count: productMarkers.length })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {selectedDestination && productMarkers.length > 0 ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-2 sm:p-3">
                  <div className="pointer-events-auto flex items-end gap-2">
                    <div
                      ref={carouselRef}
                      className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      role="list"
                      aria-label={t('carouselAria')}
                    >
                      {productMarkers.map((product) => {
                        const isActive = product.id === activeProductId;
                        const imageSrc = product.imageUrl?.trim() || PLACEHOLDER_IMAGE;
                        return (
                          <article
                            key={product.id}
                            data-product-id={product.id}
                            role="listitem"
                            className={`flex w-[13.5rem] shrink-0 snap-start gap-2 rounded-xl border bg-white/95 p-1.5 shadow-md backdrop-blur-md transition dark:bg-zinc-900/95 sm:w-[15rem] ${
                              isActive
                                ? 'border-primary shadow-primary/20 ring-1 ring-primary/25'
                                : 'border-white/80 dark:border-zinc-700'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleProductSelect(product.id)}
                              className="relative h-[3.25rem] w-[3.25rem] shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                              aria-label={product.title}
                            >
                              <Image
                                src={imageSrc}
                                alt=""
                                fill
                                sizes="52px"
                                className="object-cover"
                                unoptimized
                              />
                              <span
                                className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full ring-1 ring-white"
                                style={{ backgroundColor: product.fillColor }}
                                title={product.kindLabel}
                                aria-hidden
                              />
                            </button>
                            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => handleProductSelect(product.id)}
                                className="min-w-0 text-left"
                              >
                                <span className="block truncate text-[11px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50 sm:text-xs">
                                  {product.title}
                                </span>
                                <span className="mt-0.5 block truncate text-[10px] leading-snug text-zinc-500 dark:text-zinc-400">
                                  {product.subtitle}
                                </span>
                              </button>
                              <Link
                                href={product.href}
                                className="mt-0.5 w-fit text-[10px] font-semibold leading-none text-primary hover:underline"
                              >
                                {t('viewMoreProduct')}
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    <Link
                      href={seeMoreHref}
                      className="mb-0.5 shrink-0 rounded-full bg-white/95 px-3 py-2 text-[10px] font-semibold text-zinc-800 shadow-md backdrop-blur-md hover:bg-white dark:bg-zinc-900/95 dark:text-zinc-100"
                    >
                      {t('viewMore')}
                    </Link>
                  </div>
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
