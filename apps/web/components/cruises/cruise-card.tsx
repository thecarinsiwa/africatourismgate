'use client';

import Link from 'next/link';
import {
  buildCruiseDetailHref,
  formatCruisePrice,
  type CruiseDetailSearchParams,
} from '../../lib/cruises/listings';
import { formatCruisePortLabel } from '../../lib/cruises/ports';
import type { CruiseSearchResult } from '../../lib/cruises/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';
import { PriceDisplay, ProductCard } from '../shared';

type CruiseCardProps = {
  sailing: CruiseSearchResult;
  t: Translations['cruises'];
  searchParams?: CruiseDetailSearchParams;
  locale?: string;
};

export function CruiseCard({ sailing, t, searchParams = {}, locale }: CruiseCardProps) {
  const detailParams: CruiseDetailSearchParams = {
    sailFrom: searchParams.sailFrom ?? sailing.sailFromPortCode,
    sailTo: searchParams.sailTo ?? sailing.sailToPortCode,
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    guests: searchParams.guests,
  };
  const detailHref = buildCruiseDetailHref(sailing.id, detailParams);
  const reserveHref = buildCruiseDetailHref(sailing.id, detailParams, '#cabins');
  const nightsLabel =
    sailing.durationNights === 1
      ? `1 ${t.nightSingular}`
      : `${sailing.durationNights} ${t.nightPlural}`;

  return (
    <ProductCard
      image={
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2744] to-primary/80">
          <svg
            className="absolute right-6 top-1/2 h-20 w-20 -translate-y-1/2 text-white/10"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v-2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v2h-2zM12 2c-2.67 0-4.33 1.33-5 4 1-1 2.67-1.5 5-1.5s4 .5 5 1.5c-.67-2.67-2.33-4-5-4z" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {sailing.cruiseLineName}
            </p>
            <p className="mt-1 text-xl font-bold leading-tight">{sailing.shipName}</p>
            <p className="mt-2 text-sm text-white/80">{sailing.itineraryName}</p>
          </div>
        </div>
      }
      title={
        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">
          {formatCruisePortLabel(sailing.sailFromPortCode, sailing.sailFromPortName)} →{' '}
          {formatCruisePortLabel(sailing.sailToPortCode, sailing.sailToPortName)}
        </h3>
      }
      meta={
        <p className="text-sm text-atg-muted">
          {sailing.shipName} · {formatDisplayDate(sailing.departureDate, locale)} →{' '}
          {formatDisplayDate(sailing.returnDate, locale)} · {nightsLabel}
        </p>
      }
      body={
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="inline-flex min-h-[32px] items-center rounded-lg bg-primary/10 px-2 text-xs font-bold text-primary dark:bg-primary/20">
            {sailing.sailFromPortCode}
          </span>
          <div className="flex flex-1 items-center gap-1" aria-hidden>
            <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
            <svg className="h-4 w-4 shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
            <span className="h-px flex-1 bg-atg-border dark:bg-atg-border" />
          </div>
          <span className="inline-flex min-h-[32px] items-center rounded-lg bg-primary/10 px-2 text-xs font-bold text-primary dark:bg-primary/20">
            {sailing.sailToPortCode}
          </span>
        </div>
      }
      price={
        <PriceDisplay
          prefixLabel={t.fromPrice}
          amount={formatCruisePrice(sailing.minPriceCents, sailing.currency)}
          suffixLabel={t.perGuest}
        />
      }
      actions={
        <>
          <Link
            href={detailHref}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-atg-fg transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
          >
            {t.viewDetails}
          </Link>
          <Link
            href={reserveHref}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
          >
            {t.bookNow}
          </Link>
        </>
      }
    />
  );
}
