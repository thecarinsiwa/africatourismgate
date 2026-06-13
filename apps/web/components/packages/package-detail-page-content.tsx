'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPackageDetail } from '../../lib/api/public';
import {
  buildPackageDetailHrefWithSelections,
  isActivityOnlyPackage,
  parsePackageScheduleSelections,
  parseParticipantsParam,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageDetail } from '../../lib/packages/types';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildPackageReservationDraft,
  buildReservationQuery,
} from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PackageActivityConfigItem } from './package-activity-config-section';
import {
  PackageBookingMobileBar,
  PackageBookingSidebar,
  PackageMixedBookingMobileBar,
  PackageMixedBookingSidebar,
} from './package-booking-sidebar';
import { PackageItemsSection } from './package-items-section';

type PackageDetailPageContentProps = {
  packageId: string;
  initialSearch: PackagesSearchParams;
  rawSearchParams: Record<string, string | string[] | undefined>;
};

export function PackageDetailPageContent({
  packageId,
  initialSearch,
  rawSearchParams,
}: PackageDetailPageContentProps) {
  const t = useTranslations();
  const p = t.packages;
  const a = t.activities;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [date, setDate] = useState(initialSearch.date ?? '');
  const [participants, setParticipants] = useState(
    parseParticipantsParam(initialSearch.participants),
  );
  const [selections, setSelections] = useState<Record<string, string | undefined>>(() =>
    parsePackageScheduleSelections(rawSearchParams),
  );

  const listHref = `/packages${initialSearch.search ? `?search=${encodeURIComponent(initialSearch.search)}` : ''}`;

  const activityItems = useMemo(
    () => detail?.items.filter((item) => item.itemType === 'activity') ?? [],
    [detail],
  );

  const activityIds = useMemo(
    () => activityItems.map((item) => item.itemId),
    [activityItems],
  );

  const activityOnly = useMemo(
    () => (detail ? isActivityOnlyPackage(detail.items) : false),
    [detail],
  );

  const searchContext = useMemo(
    (): PackagesSearchParams => ({
      ...initialSearch,
      date: date || undefined,
      participants: String(participants),
    }),
    [initialSearch, date, participants],
  );

  const syncUrl = useCallback(
    (overrides: {
      date?: string;
      participants?: number;
      selections?: Record<string, string | undefined>;
    } = {}) => {
      const nextDate = overrides.date ?? date;
      const nextParticipants = overrides.participants ?? participants;
      const nextSelections = overrides.selections ?? selections;

      const href = buildPackageDetailHrefWithSelections(
        packageId,
        {
          ...initialSearch,
          date: nextDate || undefined,
          participants: String(nextParticipants),
        },
        activityIds,
        nextSelections,
      );
      router.replace(href, { scroll: false });
    },
    [packageId, initialSearch, date, participants, selections, activityIds, router],
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getPackageDetail(packageId)
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
  }, [packageId, fetchId]);

  useEffect(() => {
    setSelections(parsePackageScheduleSelections(rawSearchParams));
  }, [rawSearchParams]);

  function handleDateChange(value: string) {
    setDate(value);
    setSelections({});
    syncUrl({ date: value, selections: {} });
  }

  function handleParticipantsChange(value: number) {
    setParticipants(value);
    syncUrl({ participants: value });
  }

  function handleSelectSchedule(activityId: string, scheduleId: string) {
    const nextSelections = { ...selections, [activityId]: scheduleId };
    setSelections(nextSelections);
    syncUrl({ selections: nextSelections });
  }

  const canAddToCart = Boolean(
    activityOnly &&
      date &&
      buildPackageReservationDraft(packageId, date, participants, activityIds, selections),
  );

  function handleAddToCart() {
    if (!date) return;
    const draft = buildPackageReservationDraft(
      packageId,
      date,
      participants,
      activityIds,
      selections,
    );
    if (!draft) return;
    router.push(`/booking/cart?${buildReservationQuery(draft)}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />

      <div className="border-b border-gray-200 bg-white dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-atg-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">
              {p.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="hover:text-primary">
              {p.breadcrumbPackages}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-[#0f1a16] dark:text-white">
              {detail?.package.name ?? '…'}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">{p.loadingDetail}</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{p.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {p.retry}
            </button>
          </div>
        )}

        {notFound && !loading && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h1 className="text-xl font-bold text-[#0f1a16] dark:text-white">{p.notFound}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{p.notFoundHint}</p>
            <Link
              href={listHref}
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {p.backToList}
            </Link>
          </div>
        )}

        {detail && !loading && !notFound && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {p.cardBadge}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#0f1a16] dark:text-white">
                  {detail.package.name}
                </h1>
                {detail.package.description ? (
                  <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-atg-muted">
                    {detail.package.description}
                  </p>
                ) : null}
              </header>

              <PackageItemsSection
                items={detail.items}
                t={p}
                activityOnly={activityOnly}
                searchParams={searchContext}
              />

              {activityOnly ? (
                <section
                  id="configure"
                  className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">
                      {p.configureTitle}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                      {p.activityConfigureHint}
                    </p>
                  </div>

                  <label className="block max-w-sm text-sm">
                    <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                      {a.date}
                    </span>
                    <input
                      type="date"
                      value={date}
                      onChange={(event) => handleDateChange(event.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                    />
                  </label>

                  {date ? (
                    <div className="space-y-4">
                      {activityItems.map((item) => (
                        <PackageActivityConfigItem
                          key={item.id}
                          activityId={item.itemId}
                          label={item.label}
                          date={date}
                          participants={participants}
                          selectedScheduleId={selections[item.itemId] ?? null}
                          onSelectSchedule={(scheduleId) =>
                            handleSelectSchedule(item.itemId, scheduleId)
                          }
                          t={p}
                          a={a}
                          locale={locale}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700 dark:text-amber-300">{p.selectDateHint}</p>
                  )}
                </section>
              ) : (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                  {p.mixedConfigureHint}
                </section>
              )}
            </div>

            {activityOnly ? (
              <PackageBookingSidebar
                detail={detail}
                date={date || null}
                participants={participants}
                activityIds={activityIds}
                selections={selections}
                canAddToCart={canAddToCart}
                onParticipantsChange={handleParticipantsChange}
                onAddToCart={handleAddToCart}
                t={p}
                a={a}
                locale={locale}
              />
            ) : (
              <PackageMixedBookingSidebar detail={detail} t={p} />
            )}
          </div>
        )}
      </div>

      {detail && activityOnly && !loading && !notFound && (
        <PackageBookingMobileBar
          detail={detail}
          canAddToCart={canAddToCart}
          onAddToCart={handleAddToCart}
          t={p}
        />
      )}

      {detail && !activityOnly && !loading && !notFound && (
        <PackageMixedBookingMobileBar detail={detail} t={p} />
      )}

      <HomeFooter />
    </div>
  );
}
