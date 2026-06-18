'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPackageDetail } from '../../lib/api/public';
import {
  buildPackageTravelDates,
  computePackageEndDate,
  parsePackageDurationDays,
} from '../../lib/packages/package-dates';
import {
  buildPackageDetailHrefWithLines,
  isActivityOnlyPackage,
  parsePackageLineSelections,
  parseParticipantsParam,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import { lineMatchesPackageItem, type PackageLineSelection } from '../../lib/packages/package-lines';
import type { PackageDetail } from '../../lib/packages/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildPackageReservationDraft,
  buildReservationQuery,
} from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ProductGallery } from '../shared';
import { PackageBookingMobileBar, PackageBookingSidebar } from './package-booking-sidebar';
import {
  PackageCompositionStepper,
  type PackageCompositionStep,
} from './package-composition-stepper';
import { PackageItemConfigItem } from './package-item-config-section';
import { PackageItemsSection } from './package-items-section';
import { PackageResolvedSummary } from './package-resolved-summary';

type PackageDetailPageContentProps = {
  packageId: string;
  initialSearch: PackagesSearchParams;
  rawSearchParams: Record<string, string | string[] | undefined>;
};

function countConfiguredLines(
  items: PackageDetail['items'],
  lines: Array<PackageLineSelection | null>,
): number {
  return items.filter(
    (item, index) => {
      const line = lines[index];
      return line != null && lineMatchesPackageItem(line, item);
    },
  ).length;
}

function inferInitialStep(
  items: PackageDetail['items'],
  lines: Array<PackageLineSelection | null>,
  startDate: string,
): PackageCompositionStep {
  if (!startDate) return 'overview';
  const configured = countConfiguredLines(items, lines);
  if (configured === items.length && items.length > 0) return 'recap';
  if (startDate) return 'configure';
  return 'overview';
}

export function PackageDetailPageContent({
  packageId,
  initialSearch,
  rawSearchParams,
}: PackageDetailPageContentProps) {
  const t = useTranslations();
  const p = t.packages;
  const a = t.activities;
  const h = t.hotels;
  const f = t.flights;
  const c = t.cars;
  const cr = t.cruises;
  const { locale } = useLocale();
  const router = useRouter();

  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const [startDate, setStartDate] = useState(
    initialSearch.startDate ?? initialSearch.date ?? '',
  );
  const [travelers, setTravelers] = useState(
    parseParticipantsParam(initialSearch.travelers ?? initialSearch.participants),
  );
  const [lineSelections, setLineSelections] = useState<Array<PackageLineSelection | null>>([]);
  const [step, setStep] = useState<PackageCompositionStep>('overview');

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

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getPackageDetail(packageId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        const parsedLines = parsePackageLineSelections(rawSearchParams, data.items.length);
        setLineSelections(parsedLines);
        setStep(
          inferInitialStep(
            data.items,
            parsedLines,
            initialSearch.startDate ?? initialSearch.date ?? '',
          ),
        );
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

  const configuredCount = detail ? countConfiguredLines(detail.items, lineSelections) : 0;
  const allConfigured = detail ? configuredCount === detail.items.length : false;
  const activityOnly = detail ? isActivityOnlyPackage(detail.items) : false;

  const configContext = useMemo(() => {
    const dates = startDate
      ? buildPackageTravelDates(startDate, durationDays, travelers)
      : null;
    return {
      date: startDate,
      participants: travelers,
      checkIn: dates?.checkIn ?? startDate,
      checkOut: dates?.checkOut ?? endDate,
      guests: travelers,
      departureDate: startDate,
      passengers: travelers,
      pickupDate: startDate,
      returnDate: endDate,
      sailingId: initialSearch.sailingId ?? '',
    };
  }, [startDate, durationDays, travelers, endDate, initialSearch.sailingId]);

  function handleStartDateChange(value: string) {
    setStartDate(value);
    const cleared = detail ? Array.from({ length: detail.items.length }, () => null) : [];
    setLineSelections(cleared);
    setStep(value ? 'configure' : 'overview');
    syncUrl({
      search: { ...searchContext, startDate: value || undefined },
      lineSelections: cleared,
    });
  }

  function handleTravelersChange(value: number) {
    const next = Math.max(1, value);
    setTravelers(next);
    const cleared = detail ? Array.from({ length: detail.items.length }, () => null) : [];
    setLineSelections(cleared);
    syncUrl({
      search: { ...searchContext, travelers: String(next) },
      lineSelections: cleared,
    });
  }

  function handleLineChange(index: number, line: PackageLineSelection | null) {
    setLineSelections((current) => {
      const next = [...current];
      next[index] = line;
      syncUrl({ lineSelections: next });
      return next;
    });
  }

  function goToStep(next: PackageCompositionStep) {
    setStep(next);
    if (next === 'configure') {
      document.getElementById('configure')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (next === 'recap') {
      document.getElementById('recap')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const canAddToCart = Boolean(
    detail &&
      step === 'recap' &&
      startDate &&
      allConfigured &&
      buildPackageReservationDraft(packageId, detail.items, lineSelections),
  );

  function handleAddToCart() {
    if (!detail) return;
    const draft = buildPackageReservationDraft(packageId, detail.items, lineSelections);
    if (!draft) return;
    router.push(`/booking/cart?${buildReservationQuery(draft)}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />

      <div className="border-b border-atg-border bg-atg-elevated dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-atg-muted"
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
            <span className="font-medium text-atg-fg">
              {detail?.package.name ?? '…'}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8 lg:pb-8">
        {loading && (
          <div className="rounded-2xl border border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-atg-muted">{p.loadingDetail}</p>
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
          <div className="rounded-2xl border border-dashed border-atg-border bg-atg-elevated px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h1 className="text-xl font-bold text-atg-fg">{p.notFound}</h1>
            <p className="mt-2 text-sm text-atg-muted">{p.notFoundHint}</p>
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
              {detail.images && detail.images.length > 0 ? (
                <ProductGallery
                  images={detail.images}
                  name={detail.package.name}
                  labels={{
                    ariaLabel: p.galleryAria,
                    openLightbox: p.galleryOpenLightbox,
                    close: p.galleryClose,
                    previous: p.galleryPrevious,
                    next: p.galleryNext,
                    counter: p.galleryCounter,
                  }}
                />
              ) : null}

              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {p.cardBadge}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-atg-fg">
                  {detail.package.name}
                </h1>
                {detail.package.description ? (
                  <p className="mt-4 text-base leading-relaxed text-atg-muted">
                    {detail.package.description}
                  </p>
                ) : null}
              </header>

              <PackageCompositionStepper
                step={step}
                configuredCount={configuredCount}
                totalCount={detail.items.length}
                t={p}
              />

              {step === 'overview' ? (
                <>
                  <PackageItemsSection items={detail.items} t={p} />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => goToStep('configure')}
                      className="min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover"
                    >
                      {p.startConfiguration}
                    </button>
                  </div>
                </>
              ) : null}

              {step === 'configure' ? (
                <section
                  id="configure"
                  className="scroll-mt-28 space-y-6 rounded-2xl border border-atg-border bg-atg-elevated p-6 dark:border-atg-border dark:bg-atg-elevated"
                >
                  <div>
                    <h2 className="text-lg font-bold text-atg-fg">{p.configureTitle}</h2>
                    <p className="mt-2 text-sm text-atg-muted">
                      {p.packageBookingHint.replace('{days}', String(durationDays))}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium text-atg-muted">
                        {p.departureDateLabel}
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => handleStartDateChange(event.target.value)}
                        className="min-h-[44px] w-full rounded-lg border border-atg-border px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                      />
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block font-medium text-atg-muted">
                        {p.travelersLabel}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={travelers}
                        onChange={(event) =>
                          handleTravelersChange(Number.parseInt(event.target.value, 10) || 1)
                        }
                        className="min-h-[44px] w-full rounded-lg border border-atg-border px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                      />
                    </label>

                    {startDate ? (
                      <div className="sm:col-span-2 rounded-xl bg-atg-surface px-4 py-3 text-sm dark:bg-atg-surface/60">
                        <p className="font-medium text-atg-fg">{p.returnDateLabel}</p>
                        <p className="mt-1 text-atg-muted">
                          {formatDisplayDate(endDate, locale)} ·{' '}
                          {p.durationDaysLabel.replace('{days}', String(durationDays))}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {!startDate ? (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {p.selectDepartureHint}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {activityOnly ? (
                        <h3 className="text-base font-bold text-atg-fg">
                          {p.configureSchedulesTitle}
                        </h3>
                      ) : (
                        <h3 className="text-base font-bold text-atg-fg">
                          {p.includedServicesTitle}
                        </h3>
                      )}

                      {detail.items.map((item, index) => (
                        <PackageItemConfigItem
                          key={item.id}
                          item={item}
                          index={index}
                          selectedLine={lineSelections[index] ?? null}
                          onChange={(line) => handleLineChange(index, line)}
                          context={configContext}
                          t={p}
                          a={a}
                          h={h}
                          f={f}
                          c={c}
                          cr={cr}
                          locale={locale}
                        />
                      ))}

                      {!allConfigured ? (
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {p.allItemsRequired}
                        </p>
                      ) : null}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
                    <button
                      type="button"
                      onClick={() => goToStep('overview')}
                      className="min-h-[44px] rounded-lg border border-atg-border px-5 py-2 text-sm font-semibold text-atg-fg hover:border-primary dark:border-atg-border"
                    >
                      {p.stepBack}
                    </button>
                    <button
                      type="button"
                      disabled={!startDate || !allConfigured}
                      onClick={() => goToStep('recap')}
                      className="min-h-[44px] rounded-lg bg-primary px-6 py-2 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {p.viewRecap}
                    </button>
                  </div>
                </section>
              ) : null}

              {step === 'recap' ? (
                <section
                  id="recap"
                  className="scroll-mt-28 space-y-4 rounded-2xl border border-atg-border bg-atg-elevated p-6 dark:border-atg-border dark:bg-atg-elevated"
                >
                  <div>
                    <h2 className="text-lg font-bold text-atg-fg">{p.recapTitle}</h2>
                    <p className="mt-2 text-sm text-atg-muted">{p.recapHint}</p>
                  </div>

                  <PackageResolvedSummary
                    items={detail.items}
                    lines={lineSelections}
                    t={p}
                  />

                  <div className="flex flex-wrap gap-3 border-t border-atg-border pt-4 dark:border-atg-border">
                    <button
                      type="button"
                      onClick={() => goToStep('configure')}
                      className="min-h-[44px] rounded-lg border border-atg-border px-5 py-2 text-sm font-semibold text-atg-fg hover:border-primary dark:border-atg-border"
                    >
                      {p.modifySelection}
                    </button>
                  </div>
                </section>
              ) : null}
            </div>

            <PackageBookingSidebar
              detail={detail}
              startDate={startDate}
              endDate={endDate}
              durationDays={durationDays}
              resolving={false}
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
          resolving={false}
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
