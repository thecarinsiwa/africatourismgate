'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { browseActivities } from '../../lib/api/public';
import {
  buildActivityDetailHref,
  formatActivityPrice,
} from '../../lib/activities/listings';
import type { ActivitySearchResult } from '../../lib/activities/types';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { useScrollAnimation } from './use-scroll-animation';

const ActivitiesMapInner = dynamic(
  () => import('./activities-map-inner').then((m) => m.ActivitiesMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[480px]" />
    ),
  },
);

export type ActivityMapMarker = {
  id: string;
  title: string;
  destination: string;
  latitude: number;
  longitude: number;
  priceLabel: string;
  nextDateLabel: string | null;
  href: string;
  viewLabel: string;
};

function hasMapCoordinates(
  activity: ActivitySearchResult,
): activity is ActivitySearchResult & { latitude: number; longitude: number } {
  return (
    activity.availableSchedulesCount > 0 &&
    typeof activity.latitude === 'number' &&
    Number.isFinite(activity.latitude) &&
    typeof activity.longitude === 'number' &&
    Number.isFinite(activity.longitude)
  );
}

function toDateParam(iso?: string): string {
  if (!iso) {
    return new Date().toISOString().slice(0, 10);
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function ActivitiesMapSection() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [activities, setActivities] = useState<ActivitySearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void browseActivities({ limit: 100 })
      .then((response) => {
        if (!cancelled) {
          setActivities(response.data);
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

  const markers = useMemo<ActivityMapMarker[]>(() => {
    return activities.filter(hasMapCoordinates).map((activity) => {
      const date = toDateParam(activity.nextStartDatetime);
      const nextDate = activity.nextStartDatetime
        ? new Date(activity.nextStartDatetime).toLocaleDateString(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : null;

      return {
        id: activity.id,
        title: activity.title,
        destination: activity.destination,
        latitude: activity.latitude,
        longitude: activity.longitude,
        priceLabel: formatActivityPrice(activity.priceCents, activity.currency),
        nextDateLabel: nextDate ? `${t.activitiesMap.nextDate}: ${nextDate}` : null,
        href: buildActivityDetailHref(activity.id, { date }),
        viewLabel: t.activitiesMap.viewActivity,
      };
    });
  }, [activities, locale, t.activitiesMap.nextDate, t.activitiesMap.viewActivity]);

  return (
    <section
      ref={ref}
      className="border-y border-atg-border bg-atg-elevated py-16 transition-colors dark:border-atg-border dark:bg-atg-elevated sm:py-20"
      aria-labelledby="activities-map-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-10 max-w-2xl mx-auto text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
        >
          <h2
            id="activities-map-heading"
            className="text-2xl font-bold uppercase tracking-wide text-atg-fg sm:text-3xl"
          >
            {t.activitiesMap.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-atg-muted">
            {t.activitiesMap.subtitle}
          </p>
        </div>

        <div className={`${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {loading ? (
            <div
              className="h-[420px] w-full animate-pulse rounded-xl bg-atg-surface sm:h-[480px]"
              aria-busy="true"
              aria-label={t.activitiesMap.loading}
            />
          ) : error ? (
            <p className="text-center text-sm text-atg-muted" role="alert">
              {t.activitiesMap.loadError}
            </p>
          ) : markers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-atg-border bg-atg-surface px-6 py-16 text-center">
              <p className="text-sm text-atg-muted">{t.activitiesMap.empty}</p>
              <Link
                href="/activities"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                {t.activitiesMap.browseAll}
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-atg-border shadow-md">
              <ActivitiesMapInner markers={markers} ariaLabel={t.activitiesMap.mapAria} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
