'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPackageDetail } from '../../lib/api/public';
import {
  buildPackageDetailHrefWithLines,
  parsePackageLineSelections,
  parseParticipantsParam,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageLineSelection } from '../../lib/packages/package-lines';
import type { PackageDetail } from '../../lib/packages/types';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  buildPackageReservationDraft,
  buildReservationQuery,
} from '../../lib/reservations/flow';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PackageBookingMobileBar, PackageBookingSidebar } from './package-booking-sidebar';
import { PackageItemConfigItem } from './package-item-config-section';
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

  const [date, setDate] = useState(initialSearch.date ?? '');
  const [participants, setParticipants] = useState(
    parseParticipantsParam(initialSearch.participants),
  );
  const [checkIn, setCheckIn] = useState(initialSearch.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(initialSearch.checkOut ?? '');
  const [guests, setGuests] = useState(parseParticipantsParam(initialSearch.guests));
  const [departureDate, setDepartureDate] = useState(initialSearch.departureDate ?? '');
  const [passengers, setPassengers] = useState(parseParticipantsParam(initialSearch.passengers));
  const [pickupDate, setPickupDate] = useState(initialSearch.pickupDate ?? '');
  const [returnDate, setReturnDate] = useState(initialSearch.returnDate ?? '');
  const [sailingId, setSailingId] = useState(initialSearch.sailingId ?? '');
  const [lineSelections, setLineSelections] = useState<Array<PackageLineSelection | null>>([]);

  const listHref = `/packages${initialSearch.search ? `?search=${encodeURIComponent(initialSearch.search)}` : ''}`;

  const itemTypes = useMemo(
    () => new Set(detail?.items.map((item) => item.itemType) ?? []),
    [detail],
  );

  const configContext = useMemo(
    () => ({
      date,
      participants,
      checkIn,
      checkOut,
      guests,
      departureDate,
      passengers,
      pickupDate,
      returnDate,
      sailingId,
    }),
    [
      date,
      participants,
      checkIn,
      checkOut,
      guests,
      departureDate,
      passengers,
      pickupDate,
      returnDate,
      sailingId,
    ],
  );

  const searchContext = useMemo(
    (): PackagesSearchParams => ({
      ...initialSearch,
      date: date || undefined,
      participants: String(participants),
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: String(guests),
      departureDate: departureDate || undefined,
      passengers: String(passengers),
      pickupDate: pickupDate || undefined,
      returnDate: returnDate || undefined,
      sailingId: sailingId || undefined,
    }),
    [
      initialSearch,
      date,
      participants,
      checkIn,
      checkOut,
      guests,
      departureDate,
      passengers,
      pickupDate,
      returnDate,
      sailingId,
    ],
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
    if (!detail) return;
    setLineSelections(parsePackageLineSelections(rawSearchParams, detail.items.length));
  }, [rawSearchParams, detail]);

  function handleLineChange(index: number, line: PackageLineSelection | null) {
    setLineSelections((prev) => {
      const next = [...prev];
      while (next.length < (detail?.items.length ?? 0)) next.push(null);
      next[index] = line;
      syncUrl({ lineSelections: next });
      return next;
    });
  }

  function updateSearchContext(next: PackagesSearchParams) {
    if (next.date !== undefined) setDate(next.date ?? '');
    if (next.participants !== undefined) setParticipants(parseParticipantsParam(next.participants));
    if (next.checkIn !== undefined) setCheckIn(next.checkIn ?? '');
    if (next.checkOut !== undefined) setCheckOut(next.checkOut ?? '');
    if (next.guests !== undefined) setGuests(parseParticipantsParam(next.guests));
    if (next.departureDate !== undefined) setDepartureDate(next.departureDate ?? '');
    if (next.passengers !== undefined) setPassengers(parseParticipantsParam(next.passengers));
    if (next.pickupDate !== undefined) setPickupDate(next.pickupDate ?? '');
    if (next.returnDate !== undefined) setReturnDate(next.returnDate ?? '');
    if (next.sailingId !== undefined) setSailingId(next.sailingId ?? '');
    setLineSelections(Array.from({ length: detail?.items.length ?? 0 }, () => null));
    syncUrl({ search: next, lineSelections: [] });
  }

  const configuredCount = lineSelections.filter(Boolean).length;
  const totalItems = detail?.items.length ?? 0;

  const canAddToCart = Boolean(
    detail && buildPackageReservationDraft(packageId, detail.items, lineSelections),
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

              <PackageItemsSection
                items={detail.items}
                t={p}
                configureInline
                searchParams={searchContext}
              />

              <section
                id="configure"
                className="scroll-mt-28 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated"
              >
                <div>
                  <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">
                    {p.configureTitle}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                    {p.mixedConfigureHint}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {itemTypes.has('activity') && (
                    <>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {a.date}
                        </span>
                        <input
                          type="date"
                          value={date}
                          onChange={(event) =>
                            updateSearchContext({ ...searchContext, date: event.target.value })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {a.participants}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={participants}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              participants: String(
                                Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                              ),
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                    </>
                  )}

                  {itemTypes.has('property') && (
                    <>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {h.checkIn}
                        </span>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(event) =>
                            updateSearchContext({ ...searchContext, checkIn: event.target.value })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {h.checkOut}
                        </span>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(event) =>
                            updateSearchContext({ ...searchContext, checkOut: event.target.value })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {h.guests}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={guests}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              guests: String(
                                Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                              ),
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                    </>
                  )}

                  {itemTypes.has('flight') && (
                    <>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {f.departureDate}
                        </span>
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              departureDate: event.target.value,
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {f.passengers}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={9}
                          value={passengers}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              passengers: String(
                                Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                              ),
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                    </>
                  )}

                  {itemTypes.has('vehicle') && (
                    <>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {c.pickupDate}
                        </span>
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              pickupDate: event.target.value,
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {c.returnDate}
                        </span>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              returnDate: event.target.value,
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                    </>
                  )}

                  {itemTypes.has('cruise') && (
                    <>
                      <label className="block text-sm sm:col-span-2">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {p.sailingIdLabel}
                        </span>
                        <input
                          type="text"
                          value={sailingId}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              sailingId: event.target.value.trim(),
                            })
                          }
                          placeholder={p.sailingIdPlaceholder}
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
                          {cr.guests}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={guests}
                          onChange={(event) =>
                            updateSearchContext({
                              ...searchContext,
                              guests: String(
                                Math.max(1, Number.parseInt(event.target.value, 10) || 1),
                              ),
                            })
                          }
                          className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="space-y-4">
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
                </div>
              </section>
            </div>

            <PackageBookingSidebar
              detail={detail}
              configuredCount={configuredCount}
              totalItems={totalItems}
              canAddToCart={canAddToCart}
              onAddToCart={handleAddToCart}
              t={p}
            />
          </div>
        )}
      </div>

      {detail && !loading && !notFound && (
        <PackageBookingMobileBar
          detail={detail}
          configuredCount={configuredCount}
          totalItems={totalItems}
          canAddToCart={canAddToCart}
          onAddToCart={handleAddToCart}
          t={p}
        />
      )}

      <HomeFooter />
    </div>
  );
}
