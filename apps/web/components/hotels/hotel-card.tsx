'use client';

import type { PropertyType } from '@africatourismgate/types';
import Link from 'next/link';
import {
  buildHotelDetailHref,
  formatHotelPrice,
  type HotelAmenity,
  type HotelDetailSearchParams,
  type HotelSearchResult,
} from '../../lib/hotels/listings';
import type { Translations } from '../../lib/i18n/translations';
import { PriceDisplay, ProductCard, StarRating } from '../shared';

type HotelCardProps = {
  hotel: HotelSearchResult;
  t: Translations['hotels'];
  searchParams?: HotelDetailSearchParams;
};

const AMENITY_ICONS: Record<HotelAmenity, React.ReactNode> = {
  wifi: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M4.93 8.465a14 14 0 0114.142 0" />
    </svg>
  ),
  pool: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 12h16M6 8h12M8 16h8" />
    </svg>
  ),
  breakfast: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a4 4 0 00-4-4H6a2 2 0 00-2 2v2m16 0V6a2 2 0 00-2-2h-2a4 4 0 00-4 4v2m0 0h8" />
    </svg>
  ),
  spa: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  parking: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
};

function isHotelAmenity(code: string): code is HotelAmenity {
  return code in AMENITY_ICONS;
}

export function HotelCard({ hotel, t, searchParams = {} }: HotelCardProps) {
  const detailHref = buildHotelDetailHref(hotel.id, searchParams);
  const reserveHref = buildHotelDetailHref(hotel.id, searchParams, '#reserve');
  const typeLabel = t.types[hotel.propertyType as PropertyType] ?? hotel.propertyType;
  const locationLine = hotel.addressLine
    ? `${hotel.addressLine}, ${hotel.destinationName}`
    : hotel.destinationName;
  const priceLabel = formatHotelPrice(hotel.minPriceCents, hotel.currency);
  const displayAmenities = hotel.amenityCodes.filter(isHotelAmenity);
  const stars = hotel.starRating ?? 0;

  return (
    <ProductCard
      image={
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url("${hotel.imageUrl ?? ''}")` }}
            role="img"
            aria-label={hotel.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r" />
        </>
      }
      imageBadge={
        <span className="absolute bottom-3 left-3 rounded-md bg-atg-elevated/95 px-2 py-1 text-xs font-semibold text-atg-fg shadow dark:bg-atg-elevated">
          {typeLabel}
        </span>
      }
      title={
        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">
          {hotel.name}
        </h3>
      }
      meta={
        <p className="flex items-center gap-1.5 text-sm text-atg-muted">
          <svg
            className="h-4 w-4 shrink-0 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          {locationLine}
        </p>
      }
      body={
        <>
          {stars > 0 ? (
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <StarRating value={stars} size="sm" />
              <span className="text-xs text-atg-muted">
                {stars} {t.stars}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                {t.freeCancel}
              </span>
            </div>
          ) : null}
          {displayAmenities.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {displayAmenities.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-md bg-atg-surface px-2 py-1 text-xs text-atg-muted dark:bg-white/5"
                  title={t.amenities[a]}
                >
                  {AMENITY_ICONS[a]}
                  <span className="hidden sm:inline">{t.amenities[a]}</span>
                </span>
              ))}
            </div>
          ) : null}
        </>
      }
      price={
        <PriceDisplay
          prefixLabel={t.perNight}
          amount={priceLabel}
          suffixLabel={t.perNight}
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
