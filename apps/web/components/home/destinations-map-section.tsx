'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { PublicDestination } from '@africatourismgate/types';
import { listPublicDestinations } from '../../lib/api/public';
import { siteSearchDeepLinks } from '../../lib/site-search/deep-links';
import { useScrollAnimation } from './use-scroll-animation';
import { Spinner } from '@africatourismgate/ui';

const DestinationsMapInner = dynamic(
  () => import('./destinations-map-inner').then((m) => m.DestinationsMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[480px]" />
    ),
  },
);

export type DestinationMapMarker = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  href: string;
  viewLabel: string;
};

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

export function DestinationsMapSection() {
  const t = useTranslations('activitiesMap');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [destinations, setDestinations] = useState<PublicDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  const viewLabel = t('viewDestination');

  const markers = useMemo<DestinationMapMarker[]>(() => {
    return destinations.filter(hasMapCoordinates).map((destination) => ({
      id: destination.id,
      title: destination.name,
      subtitle: formatCountryName(destination.countryCode, locale),
      latitude: destination.latitude,
      longitude: destination.longitude,
      href: siteSearchDeepLinks.hotelsByDestination(destination.name),
      viewLabel,
    }));
  }, [destinations, locale, viewLabel]);

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
              className="flex h-[420px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-atg-border bg-atg-surface sm:h-[480px]"
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
          ) : markers.length === 0 ? (
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
              <DestinationsMapInner markers={markers} ariaLabel={t('mapAria')} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

