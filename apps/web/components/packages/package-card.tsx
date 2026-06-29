'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  buildPackageDetailHref,
  formatPackagePrice,
  hasPackageDiscount,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { useBookingCtaLabel } from '../../lib/bookings/use-booking-cta';
import { ProductCard } from '../shared';
import { PackagePriceDisplay } from './package-price-display';

type PackageCardProps = {
  pkg: PackageListItem;
  t: Translations['packages'];
  searchParams?: PackagesSearchParams;
};

export function PackageCard({ pkg, t, searchParams = {} }: PackageCardProps) {
  const ctaLabel = useBookingCtaLabel('package');
  const detailHref = buildPackageDetailHref(pkg.id, searchParams);
  const reserveHref = buildPackageDetailHref(pkg.id, searchParams, '#configure');
  const itemsLabel = t.itemsIncluded.replace('{n}', String(pkg.itemCount));
  const showSavings = hasPackageDiscount(pkg.pricing);

  const imageOverlay = (
    <div className="absolute inset-0 flex flex-col justify-center px-6 py-8 text-white">
      <span className="inline-flex w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
        {t.cardBadge}
      </span>
      <p className="mt-3 text-xl font-bold leading-tight">{pkg.name}</p>
      {pkg.description ? (
        <p className="mt-2 line-clamp-3 text-sm text-white/80">{pkg.description}</p>
      ) : null}
    </div>
  );

  return (
    <ProductCard
      image={
        pkg.imageUrl ? (
          <>
            <Image
              src={pkg.imageUrl}
              alt={pkg.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {imageOverlay}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#0f2744] to-primary/80 px-6 py-8 text-white">
            <span className="inline-flex w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              {t.cardBadge}
            </span>
            <p className="mt-3 text-xl font-bold leading-tight">{pkg.name}</p>
            {pkg.description ? (
              <p className="mt-2 line-clamp-3 text-sm text-white/80">{pkg.description}</p>
            ) : null}
          </div>
        )
      }
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
            {t.cardBadge}
          </span>
          <h3 className="text-lg font-bold text-atg-fg sm:text-xl">{pkg.name}</h3>
        </div>
      }
      meta={
        <>
          <p className="text-sm font-medium text-primary">{itemsLabel}</p>
          {pkg.discountPercent > 0 ? (
            <p className="mt-1 text-sm text-atg-muted">
              {t.discountSummary.replace('{n}', String(Math.round(pkg.discountPercent)))}
            </p>
          ) : null}
          {showSavings ? (
            <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {t.estimatedSavings.replace(
                '{amount}',
                formatPackagePrice(pkg.pricing.discountAmountCents, pkg.pricing.currency),
              )}
            </p>
          ) : null}
        </>
      }
      price={
        <PackagePriceDisplay
          pricing={pkg.pricing}
          priceLabel={t.packagePrice}
          discountBadgeTemplate={t.discountBadge}
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
            {ctaLabel}
          </Link>
        </>
      }
    />
  );
}
