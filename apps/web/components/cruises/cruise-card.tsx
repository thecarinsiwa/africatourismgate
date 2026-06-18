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
    <article className="group overflow-hidden rounded-2xl border border-atg-border bg-atg-elevated shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex shrink-0 flex-col justify-center bg-gradient-to-br from-[#0f2744] to-primary/80 px-6 py-8 text-white sm:w-56 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {sailing.cruiseLineName}
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">{sailing.shipName}</p>
          <p className="mt-2 text-sm text-white/80">{sailing.itineraryName}</p>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">
                {formatCruisePortLabel(sailing.sailFromPortCode, sailing.sailFromPortName)} →{' '}
                {formatCruisePortLabel(sailing.sailToPortCode, sailing.sailToPortName)}
              </p>
              <p className="mt-2 text-sm text-atg-muted">
                {formatDisplayDate(sailing.departureDate, locale)} →{' '}
                {formatDisplayDate(sailing.returnDate, locale)} · {nightsLabel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-atg-muted">
                {t.fromPrice}
              </p>
              <p className="text-2xl font-bold text-atg-fg">
                {formatCruisePrice(sailing.minPriceCents, sailing.currency)}
              </p>
              <p className="text-xs text-atg-muted">{t.perGuest}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-end gap-2 border-t border-atg-border pt-4 dark:border-atg-border">
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
          </div>
        </div>
      </div>
    </article>
  );
}
