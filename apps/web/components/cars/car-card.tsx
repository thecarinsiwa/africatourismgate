'use client';

import Link from 'next/link';
import {
  buildCarDetailHref,
  formatCarPrice,
  type CarDetailSearchParams,
} from '../../lib/cars/listings';
import type { VehicleSearchResult } from '../../lib/cars/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';

type CarCardProps = {
  vehicle: VehicleSearchResult;
  t: Translations['cars'];
  searchParams?: CarDetailSearchParams;
  locale?: string;
};

export function CarCard({ vehicle, t, searchParams = {}, locale }: CarCardProps) {
  const detailParams: CarDetailSearchParams = {
    pickupLocation: searchParams.pickupLocation ?? vehicle.pickupCity,
    pickupDate: searchParams.pickupDate,
    returnDate: searchParams.returnDate,
  };
  const detailHref = buildCarDetailHref(vehicle.id, detailParams);
  const reserveHref = buildCarDetailHref(vehicle.id, detailParams, '#reserve');
  const dailyLabel = formatCarPrice(vehicle.dailyPriceCents, vehicle.currency);
  const totalLabel = formatCarPrice(vehicle.totalPriceCents, vehicle.currency);
  const daysLabel =
    vehicle.rentalDays === 1
      ? `1 ${t.daySingular}`
      : `${vehicle.rentalDays} ${t.dayPlural}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex shrink-0 flex-col justify-center bg-gradient-to-br from-[#1b1b2f] to-primary/80 px-6 py-8 text-white sm:w-56 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {vehicle.categoryName}
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">
            {vehicle.exampleModel ?? vehicle.licensePlate ?? t.categoryTitle}
          </p>
          <p className="mt-2 text-sm text-white/80">{vehicle.agencyName}</p>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">{vehicle.pickupCity}</p>
              {vehicle.licensePlate && (
                <p className="mt-1 text-xs text-gray-500 dark:text-atg-muted">
                  {t.licensePlate}: {vehicle.licensePlate}
                </p>
              )}
              {searchParams.pickupDate && searchParams.returnDate && (
                <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                  {formatDisplayDate(searchParams.pickupDate, locale)} →{' '}
                  {formatDisplayDate(searchParams.returnDate, locale)} · {daysLabel}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-atg-muted">
                {dailyLabel} {t.perDay}
              </p>
              <p className="text-2xl font-bold text-[#0f1a16] dark:text-white">{totalLabel}</p>
              <p className="text-xs text-gray-500 dark:text-atg-muted">{t.totalRental}</p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-end gap-2 border-t border-gray-100 pt-4 dark:border-atg-border">
            <Link
              href={detailHref}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary dark:border-atg-border dark:text-white/80 dark:hover:border-primary dark:hover:text-white"
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
