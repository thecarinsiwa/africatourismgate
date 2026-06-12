'use client';

import Link from 'next/link';
import {
  buildPackageDetailHref,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageListItem } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
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
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-atg-border dark:bg-atg-elevated">
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex shrink-0 flex-col justify-center bg-gradient-to-br from-[#0f2744] to-primary/80 px-6 py-8 text-white sm:w-56 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {t.cardBadge}
          </p>
          <p className="mt-1 text-xl font-bold leading-tight">{pkg.name}</p>
          {pkg.description ? (
            <p className="mt-2 line-clamp-3 text-sm text-white/80">{pkg.description}</p>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-primary">{itemsLabel}</p>
              {pkg.discountPercent > 0 ? (
                <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">
                  {t.discountSummary.replace('{n}', String(Math.round(pkg.discountPercent)))}
                </p>
              ) : null}
            </div>
            <PackagePriceDisplay
              pricing={pkg.pricing}
              priceLabel={t.packagePrice}
              discountBadgeTemplate={t.discountBadge}
            />
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
