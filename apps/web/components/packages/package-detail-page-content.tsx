'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getPackageDetail } from '../../lib/api/public';
import {
  buildPackagesSearchQuery,
  isActivityOnlyPackage,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
import type { PackageDetail } from '../../lib/packages/types';
import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { PackageItemsSection } from './package-items-section';
import { PackagePriceDisplay } from './package-price-display';

type PackageDetailPageContentProps = {
  packageId: string;
  initialSearch: PackagesSearchParams;
};

export function PackageDetailPageContent({
  packageId,
  initialSearch,
}: PackageDetailPageContentProps) {
  const t = useTranslations();
  const p = t.packages;

  const [detail, setDetail] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [fetchId, setFetchId] = useState(0);

  const listHref = `/packages${buildPackagesSearchQuery(initialSearch)}`;

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setError(false);

    void getPackageDetail(packageId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('404')) setNotFound(true);
        else setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [packageId, fetchId]);

  const activityOnly = useMemo(
    () => (detail ? isActivityOnlyPackage(detail.items) : false),
    [detail],
  );

  const configureHint = activityOnly ? p.activityConfigureHint : p.mixedConfigureHint;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />

      <div className="border-b border-gray-200 bg-white dark:border-atg-border dark:bg-atg-elevated">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-atg-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">
              {p.breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="hover:text-primary">
              {p.breadcrumbPackages}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-[#0f1a16] dark:text-white">
              {detail?.package.name ?? '…'}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <p className="text-sm font-medium text-gray-600 dark:text-atg-muted">{p.loadingDetail}</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            <p>{p.loadError}</p>
            <button
              type="button"
              onClick={() => setFetchId((value) => value + 1)}
              className="mt-3 min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {p.retry}
            </button>
          </div>
        )}

        {notFound && !loading && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center dark:border-atg-border dark:bg-atg-elevated">
            <h1 className="text-xl font-bold text-[#0f1a16] dark:text-white">{p.notFound}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-atg-muted">{p.notFoundHint}</p>
            <Link
              href={listHref}
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {p.backToList}
            </Link>
          </div>
        )}

        {detail && !loading && !notFound && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <header>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {p.cardBadge}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#0f1a16] dark:text-white">
                  {detail.package.name}
                </h1>
                {detail.package.description ? (
                  <p className="mt-4 text-base leading-relaxed text-gray-600 dark:text-atg-muted">
                    {detail.package.description}
                  </p>
                ) : null}
              </header>

              <PackageItemsSection items={detail.items} t={p} />

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                {configureHint}
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-atg-border dark:bg-atg-elevated">
                <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">
                  {p.pricingTitle}
                </h2>
                <div className="mt-4">
                  <PackagePriceDisplay
                    pricing={detail.pricing}
                    priceLabel={p.packagePrice}
                    discountBadgeTemplate={p.discountBadge}
                    className="text-left [&_div]:justify-start"
                  />
                </div>
                {detail.pricing.discountAmountCents > 0 ? (
                  <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
                    {p.youSave.replace(
                      '{amount}',
                      `${(detail.pricing.discountAmountCents / 100).toFixed(0)} ${detail.pricing.currency}`,
                    )}
                  </p>
                ) : null}
                <a
                  href="#items"
                  className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover"
                >
                  {p.configurePackage}
                </a>
              </div>
            </aside>
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  );
}
