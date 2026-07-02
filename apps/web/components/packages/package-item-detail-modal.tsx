'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  buildActivityDetailHref,
  formatActivityPrice,
  formatDurationMinutes,
} from '../../lib/activities/listings';
import { getActivityDifficultyLabel } from '../../lib/activities/difficulty';
import { formatCarPrice, buildCarDetailHref } from '../../lib/cars/listings';
import { buildCruiseDetailHref, formatCruisePrice } from '../../lib/cruises/listings';
import { formatDuration, formatFlightPrice, buildFlightDetailHref } from '../../lib/flights/listings';
import { formatHotelPrice, buildHotelDetailHref } from '../../lib/hotels/listings';
import {
  loadPackageItemDetail,
  type PackageItemDetailData,
} from '../../lib/packages/package-item-detail-load';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageItemEnriched } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { ProductGallery } from '../shared';

type PackageItemDetailModalProps = {
  item: PackageItemEnriched | null;
  packageId: string;
  open: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  t: Translations['packages'];
  a: Translations['activities'];
  h: Translations['hotels'];
  c: Translations['cars'];
  cr: Translations['cruises'];
  f: Translations['flights'];
};

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-atg-surface px-4 py-3 dark:bg-atg-surface/60">
      <dt className="text-xs font-semibold uppercase tracking-wide text-atg-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-atg-fg">{value}</dd>
    </div>
  );
}

function galleryLabels(t: Translations['packages']) {
  return {
    ariaLabel: t.galleryAria,
    openLightbox: t.galleryOpenLightbox,
    close: t.galleryClose,
    previous: t.galleryPrevious,
    next: t.galleryNext,
    counter: t.galleryCounter,
  };
}

function resolveTitle(item: PackageItemEnriched, data: PackageItemDetailData | null): string {
  if (!data) return item.label;
  switch (data.kind) {
    case 'activity':
      return data.detail.title;
    case 'vehicle':
      return (
        data.detail.category.exampleModel?.trim() ||
        data.detail.category.name ||
        item.label
      );
    case 'property':
      return data.detail.name;
    case 'flight':
      return `${data.detail.airlineName} · ${data.detail.flightNumber}`;
    case 'cruise':
      return data.cabin.categoryName;
    default:
      return item.label;
  }
}

function resolveFullPageHref(
  item: PackageItemEnriched,
  data: PackageItemDetailData | null,
  startDate: string | undefined,
  endDate: string | undefined,
  travelers: number,
): string | null {
  const { start, end } = (() => {
    if (startDate?.trim()) {
      const endDateValue =
        endDate?.trim() && endDate > startDate ? endDate : undefined;
      return { start: startDate, end: endDateValue };
    }
    return { start: undefined, end: undefined };
  })();

  switch (item.itemType) {
    case 'activity':
      return buildActivityDetailHref(item.itemId, {
        date: start,
        participants: String(travelers),
      });
    case 'vehicle':
      if (!start || !end) return `/cars/${encodeURIComponent(item.itemId)}`;
      return buildCarDetailHref(item.itemId, { pickupDate: start, returnDate: end });
    case 'property':
      if (!start || !end) return `/hotels/${encodeURIComponent(item.itemId)}`;
      return buildHotelDetailHref(item.itemId, {
        checkIn: start,
        checkOut: end,
        guests: String(travelers),
      });
    case 'flight':
      if (!start) return `/flights/${encodeURIComponent(item.itemId)}`;
      return buildFlightDetailHref(item.itemId, {
        departureDate: start,
        passengers: String(travelers),
      });
    case 'cruise':
      if (data?.kind === 'cruise') {
        return buildCruiseDetailHref(data.sailingId, {
          startDate: start,
          endDate: end,
          guests: String(travelers),
          cabinId: item.itemId,
        });
      }
      return null;
    default:
      return null;
  }
}

function ItemDetailBody({
  item,
  data,
  t,
  a,
  h,
  c,
  cr,
  f,
}: {
  item: PackageItemEnriched;
  data: PackageItemDetailData;
  t: Translations['packages'];
  a: Translations['activities'];
  h: Translations['hotels'];
  c: Translations['cars'];
  cr: Translations['cruises'];
  f: Translations['flights'];
}) {
  const labels = galleryLabels(t);

  if (data.kind === 'activity') {
    const { detail } = data;
    const durationLabel = formatDurationMinutes(detail.durationMinutes, {
      hourSingular: a.hourSingular,
      hourPlural: a.hourPlural,
      minuteSingular: a.minuteSingular,
      minutePlural: a.minutePlural,
    });
    const difficultyLabel = detail.difficultyLevel
      ? getActivityDifficultyLabel(detail.difficultyLevel, {
          easy: a.difficultyEasy,
          moderate: a.difficultyModerate,
          hard: a.difficultyHard,
          expert: a.difficultyExpert,
        })
      : null;

    return (
      <div className="space-y-5">
        {detail.images && detail.images.length > 0 ? (
          <ProductGallery images={detail.images} name={detail.title} labels={labels} />
        ) : null}
        {detail.description ? (
          <p className="text-sm leading-relaxed text-atg-muted">{detail.description}</p>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <MetaCell label={a.destination} value={detail.destination} />
          <MetaCell label={a.providerLabel} value={detail.providerName} />
          {durationLabel ? <MetaCell label={a.durationLabel} value={durationLabel} /> : null}
          {difficultyLabel ? <MetaCell label={a.difficultyLabel} value={difficultyLabel} /> : null}
          <MetaCell
            label={t.itemDetailPriceLabel}
            value={formatActivityPrice(detail.priceCents, detail.currency)}
          />
        </dl>
      </div>
    );
  }

  if (data.kind === 'vehicle') {
    const { detail } = data;
    return (
      <div className="space-y-5">
        {detail.images && detail.images.length > 0 ? (
          <ProductGallery
            images={detail.images}
            name={detail.category.name}
            labels={labels}
          />
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <MetaCell label={c.categoryTitle} value={detail.category.name} />
          <MetaCell label={c.agencyTitle} value={detail.agency.name} />
          <MetaCell label={c.rentalPeriod} value={`${detail.rentalDays} ${detail.rentalDays === 1 ? c.daySingular : c.dayPlural}`} />
          <MetaCell
            label={t.itemDetailPriceLabel}
            value={`${formatCarPrice(detail.totalPriceCents, detail.currency)} (${formatCarPrice(detail.dailyPriceCents, detail.currency)}${c.perDay})`}
          />
        </dl>
      </div>
    );
  }

  if (data.kind === 'property') {
    const { detail } = data;
    return (
      <div className="space-y-5">
        {detail.images.length > 0 ? (
          <ProductGallery images={detail.images} name={detail.name} labels={labels} />
        ) : null}
        {detail.description ? (
          <p className="text-sm leading-relaxed text-atg-muted">{detail.description}</p>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <MetaCell label={a.destination} value={detail.destinationName} />
          {detail.starRating != null ? (
            <MetaCell label={h.stars} value={`${detail.starRating}★`} />
          ) : null}
          {detail.stay.nights > 0 ? (
            <MetaCell
              label={h.checkIn}
              value={`${detail.stay.checkIn ?? '—'} → ${detail.stay.checkOut ?? '—'}`}
            />
          ) : null}
          <MetaCell
            label={t.itemDetailPriceLabel}
            value={
              detail.stay.minTotalCents != null
                ? formatHotelPrice(detail.stay.minTotalCents, detail.stay.currency)
                : formatPackagePrice(item.unitPriceCents, item.currency)
            }
          />
        </dl>
      </div>
    );
  }

  if (data.kind === 'flight') {
    const { detail } = data;
    return (
      <div className="space-y-5">
        {detail.images && detail.images.length > 0 ? (
          <ProductGallery images={detail.images} name={detail.flightNumber} labels={labels} />
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2">
          <MetaCell
            label={f.departure}
            value={`${detail.departureAirport.city} (${detail.departureAirport.iataCode})`}
          />
          <MetaCell
            label={f.arrival}
            value={`${detail.arrivalAirport.city} (${detail.arrivalAirport.iataCode})`}
          />
          <MetaCell label={f.itineraryTitle} value={formatDuration(detail.durationMinutes)} />
          <MetaCell
            label={t.itemDetailPriceLabel}
            value={formatFlightPrice(detail.minPriceCents, detail.currency)}
          />
        </dl>
      </div>
    );
  }

  const { detail, cabin } = data;
  return (
    <div className="space-y-5">
      {detail.images && detail.images.length > 0 ? (
        <ProductGallery images={detail.images} name={detail.shipName} labels={labels} />
      ) : null}
      <p className="text-sm leading-relaxed text-atg-muted">
        {detail.cruiseLineName} · {detail.shipName} · {detail.itineraryName}
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        <MetaCell
          label={cr.departure}
          value={`${detail.sailFromPortName} (${detail.sailFromPortCode})`}
        />
        <MetaCell
          label={cr.arrival}
          value={`${detail.sailToPortName} (${detail.sailToPortCode})`}
        />
        <MetaCell
          label={cr.capacityLabel}
          value={`${cabin.maxGuests} ${cabin.maxGuests === 1 ? cr.guestSingular : cr.guestPlural}`}
        />
        <MetaCell
          label={t.itemDetailPriceLabel}
          value={formatCruisePrice(cabin.priceCents, cabin.currency)}
        />
      </dl>
    </div>
  );
}

export function PackageItemDetailModal({
  item,
  packageId,
  open,
  onClose,
  startDate,
  endDate,
  travelers = 1,
  t,
  a,
  h,
  c,
  cr,
  f,
}: PackageItemDetailModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [detailData, setDetailData] = useState<PackageItemDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !item) {
      setDetailData(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    void loadPackageItemDetail(item, {
      packageId,
      startDate,
      endDate,
      travelers,
    })
      .then((data) => {
        if (!cancelled) setDetailData(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDetailData(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, item, packageId, startDate, endDate, travelers]);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !item || typeof document === 'undefined') return null;

  const typeLabel = t.itemTypes[item.itemType];
  const fullPageHref = resolveFullPageHref(
    item,
    detailData,
    startDate,
    endDate,
    travelers,
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-atg-border bg-atg-elevated shadow-xl outline-none dark:border-atg-border dark:bg-atg-elevated sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-atg-border px-5 py-4 dark:border-atg-border">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{typeLabel}</p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-atg-fg">
              {resolveTitle(item, detailData)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-atg-border text-lg font-semibold text-atg-fg transition-colors hover:border-primary dark:border-atg-border"
            aria-label={t.itemDetailClose}
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <p className="text-sm text-atg-muted">{t.itemDetailLoading}</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-700 dark:text-red-300">{t.itemDetailError}</p>
          ) : null}

          {!loading && !error && detailData ? (
            <ItemDetailBody
              item={item}
              data={detailData}
              t={t}
              a={a}
              h={h}
              c={c}
              cr={cr}
              f={f}
            />
          ) : null}
        </div>

        {fullPageHref ? (
          <footer className="border-t border-atg-border px-5 py-4 dark:border-atg-border">
            <Link
              href={fullPageHref}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary dark:border-atg-border sm:w-auto"
            >
              {t.itemDetailViewFullPage}
            </Link>
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
