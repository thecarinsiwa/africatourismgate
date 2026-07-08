'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getPackageDetail } from '../../lib/api/public';
import {
  computePackageEndDate,
  parsePackageDurationDays,
} from '../../lib/packages/package-dates';
import {
  buildPackageDetailHref,
  parseParticipantsParam,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageDetail } from '../../lib/packages/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildPackageAssistedReservationDraft,
  buildReservationQuery,
} from '../../lib/reservations/flow';
import { DetailPageSkeleton } from '../shared/loading-skeletons';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { ProductGallery } from '../shared';
import { PackageBookingMobileBar, PackageBookingSidebar } from './package-booking-sidebar';
import {
  PackageCompositionStepper,
  type PackageCompositionStep,
} from './package-composition-stepper';
import { PackageItemsSection } from './package-items-section';
import { PackageAssistedResolvedSummary } from './package-resolved-summary';

type PackageDetailPageContentProps = {
  packageId: string;
  initialSearch: PackagesSearchParams;
};

function inferInitialStep(startDate: string, hash: string): PackageCompositionStep {
  if (!startDate) return 'overview';
  if (hash === '#recap') return 'recap';
  return 'configure';
}

function hasHtmlMarkup(value: string): boolean {
  return /<[^>]+>/.test(value);
}

export function PackageDetailPageContent({
  packageId,
  initialSearch,
}: PackageDetailPageContentProps) {
  const t = useTranslations();
  const p = t.packages;
  const a = t.activities;
  const h = t.hotels;
  const c = t.cars;
  const cr = t.cruises;
  const f = t.flights;
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
    (overrides: Partial<{ search: PackagesSearchParams; step: PackageCompositionStep }> = {}) => {
      const nextSearch = overrides.search ?? searchContext;
      const hash = overrides.step === 'recap' ? '#recap' : '#configure';
      const href = buildPackageDetailHref(packageId, nextSearch, hash);
      router.replace(href, { scroll: false });
    },
    [packageId, searchContext, router],
  );

  const hydratedPackageKeyRef = useRef<string | null>(null);
  const initialStartDate = initialSearch.startDate ?? initialSearch.date ?? '';

  useEffect(() => {
    hydratedPackageKeyRef.current = null;
    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getPackageDetail(packageId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
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
    if (!detail) return;

    const hydrationKey = `${packageId}:${fetchId}`;
    if (hydratedPackageKeyRef.current === hydrationKey) return;
    hydratedPackageKeyRef.current = hydrationKey;

    const hash =
      typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    setStep(inferInitialStep(initialStartDate, hash ? `#${hash}` : ''));
  }, [detail, packageId, fetchId, initialStartDate]);

  const bookingReady = Boolean(startDate && endDate && travelers >= 1);

  function handleStartDateChange(value: string) {
    setStartDate(value);
    setStep(value ? 'configure' : 'overview');
    syncUrl({
      search: { ...searchContext, startDate: value || undefined },
      step: 'configure',
    });
  }

  function handleTravelersChange(value: number) {
    const next = Math.max(1, value);
    setTravelers(next);
    syncUrl({
      search: { ...searchContext, travelers: String(next) },
      step,
    });
  }

  function goToStep(next: PackageCompositionStep) {
    setStep(next);
    syncUrl({ step: next });
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
      bookingReady &&
      buildPackageAssistedReservationDraft(packageId, startDate, endDate, travelers),
  );

  function handleAddToCart() {
    if (!detail) return;
    const draft = buildPackageAssistedReservationDraft(
      packageId,
      startDate,
      endDate,
      travelers,
    );
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
          <DetailPageSkeleton loadingLabel={p.loadingDetail} layout="package" />
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
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
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
                <h1 className="mt-2 break-words text-3xl font-bold text-atg-fg">
                  {detail.package.name}
                </h1>
                {detail.package.description ? (
                  hasHtmlMarkup(detail.package.description) ? (
                    <div
                      className="mt-4 max-w-none break-words text-base leading-relaxed text-atg-muted [&_p]:my-2 [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{ __html: detail.package.description }}
                    />
                  ) : (
                    <p className="mt-4 break-words text-base leading-relaxed text-atg-muted">
                      {detail.package.description}
                    </p>
                  )
                ) : null}
              </header>

              <PackageCompositionStepper step={step} bookingReady={bookingReady} t={p} />

              {step === 'overview' ? (
                <>
                  <PackageItemsSection
                    items={detail.items}
                    packageId={packageId}
                    t={p}
                    a={a}
                    h={h}
                    c={c}
                    cr={cr}
                    f={f}
                    startDate={startDate}
                    endDate={endDate}
                    travelers={travelers}
                  />
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
                      <h3 className="text-base font-bold text-atg-fg">
                        {p.includedServicesTitle}
                      </h3>
                      <PackageItemsSection
                    items={detail.items}
                    packageId={packageId}
                    t={p}
                    a={a}
                    h={h}
                    c={c}
                    cr={cr}
                    f={f}
                    startDate={startDate}
                    endDate={endDate}
                    travelers={travelers}
                  />
                      <p className="text-sm text-atg-muted">{p.assistedBookingServicesHint}</p>
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
                      disabled={!bookingReady}
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

                  <PackageAssistedResolvedSummary
                    items={detail.items}
                    startDate={startDate}
                    endDate={endDate}
                    travelers={travelers}
                    t={p}
                    locale={locale}
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
              travelers={travelers}
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
          travelers={travelers}
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
