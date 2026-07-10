'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getActivityDetail } from '../../lib/api/public';
import {
  buildActivitiesSearchQuery,
  buildActivityDetailHref,
  formatDurationMinutes,
  parseParticipantsParam,
  toActivityDetailQuery,
  type ActivityDetailSearchParams,
} from '../../lib/activities/listings';
import {
  getActivityDifficultyLabel,
} from '../../lib/activities/difficulty';
import type { ActivityDetail } from '../../lib/activities/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import { buildReservationQuery, isActivityScheduleOfferBookable } from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { DetailPageSkeletonShell } from '../shared/loading-skeletons';
import { ProductGallery } from '../shared';
import { ActivityBookingMobileBar, ActivityBookingSidebar } from './activity-booking-sidebar';
import { ActivitySchedulesSection } from './activity-schedules-section';
import { ActivityItinerarySection } from './activity-itinerary-section';

export type ActivityDetailPageSearch = ActivityDetailSearchParams;

type ActivityDetailPageContentProps = {
  activityId: string;
  initialSearch: ActivityDetailPageSearch;
};

export function ActivityDetailPageContent({
  activityId,
  initialSearch,
}: ActivityDetailPageContentProps) {
  const t = useTranslations();
  const a = t.activities;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [participants, setParticipants] = useState(
    parseParticipantsParam(initialSearch.participants),
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    initialSearch.scheduleId ?? null,
  );

  const searchContext = useMemo(
    (): ActivityDetailSearchParams => ({
      destination: initialSearch.destination,
      date: initialSearch.date,
      participants: String(participants),
      scheduleId: selectedScheduleId ?? undefined,
    }),
    [initialSearch.destination, initialSearch.date, participants, selectedScheduleId],
  );

  const apiQuery = useMemo(() => {
    if (!initialSearch.date) return null;
    return toActivityDetailQuery(searchContext);
  }, [initialSearch.date, searchContext]);

  const syncUrl = useCallback(
    (overrides: Partial<ActivityDetailPageSearch> = {}) => {
      const href = buildActivityDetailHref(activityId, {
        destination: initialSearch.destination,
        date: initialSearch.date,
        participants:
          overrides.participants !== undefined
            ? String(overrides.participants)
            : String(participants),
        scheduleId: overrides.scheduleId ?? selectedScheduleId ?? undefined,
      });
      router.replace(href, { scroll: false });
    },
    [activityId, initialSearch.destination, initialSearch.date, participants, selectedScheduleId, router],
  );

  useEffect(() => {
    let cancelled = false;

    if (!apiQuery) {
      setDetail(null);
      setLoading(false);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getActivityDetail(activityId, apiQuery)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activityId, apiQuery, fetchId]);

  useEffect(() => {
    if (!detail) return;

    const bookable = detail.schedules.filter((schedule) =>
      isActivityScheduleOfferBookable(schedule, participants),
    );

    if (selectedScheduleId) {
      const stillValid = bookable.some((schedule) => schedule.scheduleId === selectedScheduleId);
      if (!stillValid) {
        setSelectedScheduleId(null);
        syncUrl({ scheduleId: undefined });
      }
      return;
    }

    if (bookable.length === 1) {
      setSelectedScheduleId(bookable[0]!.scheduleId);
      syncUrl({ scheduleId: bookable[0]!.scheduleId });
    }
  }, [detail, participants, selectedScheduleId, syncUrl]);

  const selectedSchedule = useMemo(
    () => detail?.schedules.find((item) => item.scheduleId === selectedScheduleId) ?? null,
    [detail, selectedScheduleId],
  );

  function handleParticipantsChange(value: number) {
    setParticipants(value);
    syncUrl({ participants: String(value) });
  }

  function handleSelectSchedule(scheduleId: string) {
    setSelectedScheduleId(scheduleId);
    syncUrl({ scheduleId });
  }

  function handleReserve() {
    if (!selectedScheduleId || !initialSearch.date) {
      document.getElementById('schedules')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const query = buildReservationQuery({
      kind: 'activity_schedule',
      activityId,
      scheduleId: selectedScheduleId,
      date: initialSearch.date,
      participants,
    });
    router.push(`/booking/cart?${query}`);
  }

  const listHref = `/activities${buildActivitiesSearchQuery({
    destination: initialSearch.destination,
    date: initialSearch.date,
    participants: String(participants),
  })}`;

  const sidebarProps = detail
    ? {
        detail,
        selectedSchedule,
        participants,
        onParticipantsChange: handleParticipantsChange,
        onReserve: handleReserve,
        t: a,
        locale,
      }
    : null;

  if (loading && !detail) {
    return <DetailPageSkeletonShell loadingLabel={a.loading} />;
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-atg-fg">{a.notFound}</h1>
          <p className="mt-2 text-sm text-atg-muted">{a.notFoundHint}</p>
          <Link
            href={listHref}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {a.backToList}
          </Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error || !detail || !sidebarProps) {
    return (
      <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
        <HomeHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-atg-elevated p-5 dark:border-red-900/40 dark:bg-atg-elevated">
            <p className="text-sm text-red-700 dark:text-red-300">{a.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {a.retry}
            </button>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  const durationLabel = formatDurationMinutes(detail.durationMinutes, {
    hourSingular: a.hourSingular,
    hourPlural: a.hourPlural,
    minuteSingular: a.minuteSingular,
    minutePlural: a.minutePlural,
  });

  const difficultyLabel = getActivityDifficultyLabel(detail.difficultyLevel, {
    easy: a.difficultyEasy,
    moderate: a.difficultyModerate,
    hard: a.difficultyHard,
    expert: a.difficultyExpert,
  });

  const metaParts = [
    detail.destination,
    initialSearch.date ? formatDisplayDate(initialSearch.date, locale) : null,
    durationLabel ? `${a.durationLabel}: ${durationLabel}` : null,
    difficultyLabel ? `${a.difficultyLabel}: ${difficultyLabel}` : null,
  ].filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <div className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-atg-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {a.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="transition-colors hover:text-primary">
              {a.breadcrumbActivities}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-atg-fg">{detail.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="space-y-8 lg:col-span-2">
            {detail.images && detail.images.length > 0 ? (
              <ProductGallery
                images={detail.images}
                name={detail.title}
                labels={{
                  ariaLabel: a.galleryAria,
                  openLightbox: a.galleryOpenLightbox,
                  close: a.galleryClose,
                  previous: a.galleryPrevious,
                  next: a.galleryNext,
                  counter: a.galleryCounter,
                }}
              />
            ) : null}

            <header>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                {detail.providerName}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-atg-fg sm:text-3xl">
                {detail.title}
              </h1>
              <p className="mt-2 text-sm text-atg-muted">{metaParts.join(' · ')}</p>
            </header>

            {detail.description && (
              <section>
                <h2 className="mb-3 text-lg font-bold text-atg-fg">
                  {a.descriptionTitle}
                </h2>
                <p className="text-sm leading-relaxed text-atg-muted">
                  {detail.description}
                </p>
              </section>
            )}

            {detail.itineraryStops && detail.itineraryStops.length > 0 ? (
              <ActivityItinerarySection
                stops={detail.itineraryStops}
                labels={{
                  itineraryTitle: a.itineraryTitle,
                  itineraryMapAria: a.itineraryMapAria,
                  itineraryStopLabel: a.itineraryStopLabel,
                  itineraryStopDuration: a.itineraryStopDuration,
                  hourSingular: a.hourSingular,
                  hourPlural: a.hourPlural,
                  minuteSingular: a.minuteSingular,
                  minutePlural: a.minutePlural,
                }}
              />
            ) : null}

            <ActivitySchedulesSection
              schedules={detail.schedules}
              currency={detail.currency}
              selectedScheduleId={selectedScheduleId}
              participants={participants}
              onSelectSchedule={handleSelectSchedule}
              t={a}
              locale={locale}
              listHref={listHref}
            />
          </div>

          <ActivityBookingSidebar {...sidebarProps} />
        </div>
      </div>

      <ActivityBookingMobileBar {...sidebarProps} />
      <HomeFooter />
    </div>
  );
}
