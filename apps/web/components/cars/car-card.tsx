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
import { PriceDisplay, ProductCard } from '../shared';

type CarCardProps = {
  vehicle: VehicleSearchResult;
  t: Translations['cars'];
  searchParams?: CarDetailSearchParams;
  locale?: string;
};

export function CarCard({ vehicle, t, searchParams = {}, locale }: CarCardProps) {
  const detailParams: CarDetailSearchParams = {
    pickupLocation: searchParams.pickupLocation ?? vehicle.pickupCity,
    pickupDate: searchParams.pickupDate ?? vehicle.pickupDate,
    returnDate: searchParams.returnDate ?? vehicle.returnDate,
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
    <ProductCard
      image={
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1b1b2f] to-primary/80 px-6 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {vehicle.categoryName}
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">
            {vehicle.exampleModel ?? vehicle.licensePlate ?? t.categoryTitle}
          </p>
          <p className="mt-2 text-sm text-white/80">{vehicle.agencyName}</p>
        </div>
      }
      title={
        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">{vehicle.pickupCity}</h3>
      }
      meta={
        <>
          {vehicle.licensePlate ? (
            <p className="text-xs text-atg-muted">
              {t.licensePlate}: {vehicle.licensePlate}
            </p>
          ) : null}
          {detailParams.pickupDate && detailParams.returnDate ? (
            <p className="mt-1 text-sm text-atg-muted">
              {formatDisplayDate(detailParams.pickupDate, locale)} →{' '}
              {formatDisplayDate(detailParams.returnDate, locale)} · {daysLabel}
            </p>
          ) : null}
        </>
      }
      price={
        <PriceDisplay
          prefixLabel={`${dailyLabel} ${t.perDay}`}
          amount={totalLabel}
          suffixLabel={t.totalRental}
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
