'use client';

import Link from 'next/link';
import {
  buildPackageDetailHref,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { ProductCard } from '../shared';
import { PackagePriceDisplay } from './package-price-display';

type PackageCardProps = {
  pkg: PackageListItem;
  t: Translations['packages'];
  searchParams?: PackagesSearchParams;
};

export function PackageCard({ pkg, t, searchParams = {} }: PackageCardProps) {
  const detailHref = buildPackageDetailHref(pkg.id, searchParams);
  const reserveHref = buildPackageDetailHref(pkg.id, searchParams, '#items');
  const itemsLabel = t.itemsIncluded.replace('{n}', String(pkg.itemCount));

  return (
    <ProductCard
      image={
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#0f2744] to-primary/80 px-6 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {t.cardBadge}
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">{pkg.name}</p>
          {pkg.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-white/80">{pkg.description}</p>
          ) : null}
        </div>
      }
      title={
        <h3 className="text-lg font-bold text-atg-fg sm:text-xl">{pkg.name}</h3>
      }
      meta={
        <>
          <p className="text-sm font-medium text-primary">{itemsLabel}</p>
          {pkg.discountPercent > 0 ? (
            <p className="mt-1 text-sm text-atg-muted">
              {t.discountSummary.replace('{n}', String(Math.round(pkg.discountPercent)))}
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
            {t.bookNow}
          </Link>
        </>
      }
    />
  );
}
