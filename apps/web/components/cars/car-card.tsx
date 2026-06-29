'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  buildCarDetailHref,
  formatCarPrice,
  type CarDetailSearchParams,
} from '../../lib/cars/listings';
import { resolveVehicleSpecs } from '../../lib/cars/specs';
import type { VehicleSearchResult } from '../../lib/cars/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';
import { PriceDisplay, ProductCard } from '../shared';
import { CarSpecBadges } from './car-spec-badges';

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
  const displayTitle =
    vehicle.exampleModel ?? vehicle.licensePlate ?? vehicle.categoryName;
  const specs = resolveVehicleSpecs(vehicle.categoryName);

  const imageOverlay = (
    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
        {vehicle.categoryName}
      </p>
      <p className="mt-1 text-lg font-bold leading-tight">{displayTitle}</p>
      <p className="mt-1 text-sm text-white/80">{vehicle.agencyName}</p>
    </div>
  );

  return (
    <ProductCard
      image={
        vehicle.imageUrl ? (
          <>
            <Image
              src={vehicle.imageUrl}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            {imageOverlay}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b1b2f] to-primary/80">
            <svg
              className="absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 text-white/10"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
            {imageOverlay}
          </div>
        )
      }
      title={
        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">{displayTitle}</h3>
      }
      meta={
        <>
          <p className="text-sm font-medium text-primary">{vehicle.pickupCity}</p>
          {vehicle.licensePlate ? (
            <p className="mt-0.5 text-xs text-atg-muted">
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
      body={
        <CarSpecBadges
          specs={specs}
          labels={t.specs}
          transmissionLabels={t.transmission}
          fuelLabels={t.fuel}
          className="mb-4"
        />
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
