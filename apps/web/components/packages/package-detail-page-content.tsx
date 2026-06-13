'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPackageDetail } from '../../lib/api/public';
import { autoResolvePackageLines } from '../../lib/packages/auto-resolve-lines';
import {
  buildPackageTravelDates,
  computePackageEndDate,
  parsePackageDurationDays,
} from '../../lib/packages/package-dates';
import {
  buildPackageDetailHrefWithLines,
  parseParticipantsParam,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageLineSelection } from '../../lib/packages/package-lines';
import type { PackageDetail } from '../../lib/packages/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildPackageReservationDraft,
  buildReservationQuery,
} from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PackageBookingMobileBar, PackageBookingSidebar } from './package-booking-sidebar';
import { PackageItemsSection } from './package-items-section';
import { PackageResolvedSummary } from './package-resolved-summary';

type PackageDetailPageContentProps = {
  packageId: string;
  initialSearch: PackagesSearchParams;
  rawSearchParams: Record<string, string | string[] | undefined>;
};

export function PackageDetailPageContent({
  packageId,
  initialSearch,
}: PackageDetailPageContentProps) {
  const t = useTranslations();
  const p = t.packages;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [startDate, setStartDate] = useState(initialSearch.startDate ?? '');
  const [travelers, setTravelers] = useState(
    parseParticipantsParam(initialSearch.travelers),
  );
  const [lineSelections, setLineSelections] = useState<Array<PackageLineSelection | null>>([]);
  const [resolveErrors, setResolveErrors] = useState<
    Awaited<ReturnType<typeof autoResolvePackageLines>>['errors']
  >([]);
  const [resolving, setResolving] = useState(false);

  const listHref = `/packages${initialSearch.search ? `?search=${encodeURIComponent(initialSearch.search)}` : ''}`;

  const durationDays = parsePackageDurationDays(detail?.package);
  const endDate = startDate ? computePackageEndDate(startDate, durationDays) : '';

  const searchContext = useMemo(
    (): PackagesSearchParams => ({
      ...initialSearch,
      startDate: startDate || undefined,
      travelers: String(travelers),
    }),
    [initialSearch, startDate, travelers],
  );

  const syncUrl = useCallback(
    (
      overrides: Partial<{
        lineSelections: Array<PackageLineSelection | null>;
        search: PackagesSearchParams;
      }> = {},
    ) => {
      const nextLines = overrides.lineSelections ?? lineSelections;
      const nextSearch = overrides.search ?? searchContext;
      const href = buildPackageDetailHrefWithLines(
        packageId,
        nextSearch,
        nextLines,
        '#configure',
      );
      router.replace(href, { scroll: false });
    },
    [packageId, lineSelections, searchContext, router],
  );

  const syncUrlRef = useRef(syncUrl);
  const searchContextRef = useRef(searchContext);
  syncUrlRef.current = syncUrl;
  searchContextRef.current = searchContext;

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
    if (!detail || !startDate) {
      setLineSelections([]);
      setResolveErrors([]);
      return;
    }

    const dates = buildPackageTravelDates(startDate, durationDays, travelers);
    if (!dates) {
      setLineSelections([]);
      setResolveErrors([]);
      return;
    }

    let cancelled = false;
    setResolving(true);
    setResolveErrors([]);

    void autoResolvePackageLines(packageId, detail.items, dates)
      .then((result) => {
        if (cancelled) return;
        setLineSelections(result.lines);
        setResolveErrors(result.errors);
        syncUrlRef.current({
          lineSelections: result.lines,
          search: searchContextRef.current,
        });
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [detail, startDate, durationDays, travelers, packageId]);

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setLineSelections([]);
    setResolveErrors([]);
    syncUrl({
      search: { ...searchContext, startDate: value || undefined },
      lineSelections: [],
    });
  }

  function handleTravelersChange(value: number) {
    const next = Math.max(1, value);
    setTravelers(next);
    setLineSelections([]);
    setResolveErrors([]);
    syncUrl({
      search: { ...searchContext, travelers: String(next) },
      lineSelections: [],
    });
  }

  const canAddToCart = Boolean(
    detail &&
      startDate &&
      !resolving &&
      resolveErrors.length === 0 &&
      buildPackageReservationDraft(packageId, detail.items, lineSelections),
  );

  function handleAddToCart() {
    if (!detail) return;
    const draft = buildPackageReservationDraft(packageId, detail.items, lineSelections);
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

              <PackageItemsSection items={detail.items} t={p} />

              <section
                id="configure"
                className="scroll-mt-28 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated"
              >
                <div>
                  <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">
                    {p.configureTitle}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                    {p.packageBookingHint.replace('{days}', String(durationDays))}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                      {p.departureDateLabel}
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(event) => handleStartDateChange(event.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                      {p.travelersLabel}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={travelers}
                      onChange={(event) =>
                        handleTravelersChange(
                          Number.parseInt(event.target.value, 10) || 1,
                        )
                      }
                      className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                    />
                  </label>

                  {startDate ? (
                    <div className="sm:col-span-2 rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-atg-surface/60">
                      <p className="font-medium text-[#0f1a16] dark:text-white">
                        {p.returnDateLabel}
                      </p>
                      <p className="mt-1 text-gray-600 dark:text-atg-muted">
                        {formatDisplayDate(endDate, locale)} ·{' '}
                        {p.durationDaysLabel.replace('{days}', String(durationDays))}
                      </p>
                    </div>
                  ) : null}
                </div>

                {startDate ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-[#0f1a16] dark:text-white">
                      {p.includedServicesTitle}
                    </h3>
                    {resolving ? (
                      <p className="text-sm text-gray-600 dark:text-atg-muted">{p.resolvingPackage}</p>
                    ) : null}
                    <PackageResolvedSummary
                      items={detail.items}
                      lines={lineSelections}
                      errors={resolveErrors}
                      resolving={resolving}
                      t={p}
                    />
                    {!resolving && resolveErrors.length > 0 ? (
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {p.someItemsMissing}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 dark:text-amber-300">{p.selectDepartureHint}</p>
                )}
              </section>
            </div>

            <PackageBookingSidebar
              detail={detail}
              startDate={startDate}
              endDate={endDate}
              durationDays={durationDays}
              resolving={resolving}
              canAddToCart={canAddToCart}
              onAddToCart={handleAddToCart}
              t={p}
              locale={locale}
            />
          </div>
        )}
      </div>

      {detail && !loading && !notFound && (
        <PackageBookingMobileBar
          detail={detail}
          startDate={startDate}
          endDate={endDate}
          durationDays={durationDays}
          resolving={resolving}
          canAddToCart={canAddToCart}
          onAddToCart={handleAddToCart}
          t={p}
          locale={locale}
        />
      )}

      <HomeFooter />
    </div>
  );
}
