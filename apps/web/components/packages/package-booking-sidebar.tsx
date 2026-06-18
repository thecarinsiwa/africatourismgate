'use client';

import type { PackageDetail } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { formatDisplayDate } from '../../lib/hotels/dates';
import { PackagePriceDisplay } from './package-price-display';

type PackageBookingSidebarProps = {
  detail: PackageDetail;
  startDate: string;
  endDate: string;
  durationDays: number;
  resolving: boolean;
  canAddToCart: boolean;
  onAddToCart: () => void;
  t: Translations['packages'];
  locale?: string;
};

export function PackageBookingSidebar({
  detail,
  startDate,
  endDate,
  durationDays,
  resolving,
  canAddToCart,
  onAddToCart,
  t,
  locale,
}: PackageBookingSidebarProps) {
  return (
    <aside
      id="reserve"
      className="rounded-2xl border border-atg-border bg-atg-elevated p-6 shadow-md dark:border-atg-border dark:bg-atg-elevated lg:sticky lg:top-24 lg:self-start"
    >
      <h2 className="text-lg font-bold text-atg-fg">{t.pricingTitle}</h2>

      <div className="mt-4">
        <PackagePriceDisplay
          pricing={detail.pricing}
          priceLabel={t.packagePrice}
          discountBadgeTemplate={t.discountBadge}
          className="text-left [&_div]:justify-start"
        />
      </div>

      {detail.pricing.discountAmountCents > 0 ? (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          {t.youSave.replace(
            '{amount}',
            `${(detail.pricing.discountAmountCents / 100).toFixed(0)} ${detail.pricing.currency}`,
          )}
        </p>
      ) : null}

      <div className="mt-6 space-y-4 border-t border-atg-border pt-4 dark:border-atg-border">
        {startDate ? (
          <div className="space-y-1 text-sm text-atg-muted">
            <p>
              <span className="font-medium text-atg-fg">
                {t.departureDateLabel}:
              </span>{' '}
              {formatDisplayDate(startDate, locale)}
            </p>
            <p>
              <span className="font-medium text-atg-fg">
                {t.returnDateLabel}:
              </span>{' '}
              {formatDisplayDate(endDate, locale)}
            </p>
            <p>{t.durationDaysLabel.replace('{days}', String(durationDays))}</p>
          </div>
        ) : null}

        {resolving ? (
          <p className="text-sm text-atg-muted">{t.resolvingPackage}</p>
        ) : null}

        {!startDate && (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectDepartureHint}</p>
        )}

        <button
          type="button"
          disabled={!canAddToCart}
          onClick={onAddToCart}
          className="w-full min-h-[48px] rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.addToCart}
        </button>
      </div>
    </aside>
  );
}

export function PackageBookingMobileBar({
  detail,
  startDate,
  endDate,
  durationDays,
  resolving,
  canAddToCart,
  onAddToCart,
  t,
  locale,
}: PackageBookingSidebarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-atg-border bg-atg-elevated/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-atg-muted">{t.packagePrice}</p>
          <p className="text-lg font-bold text-atg-fg">
            {(detail.pricing.totalCents / 100).toFixed(0)} {detail.pricing.currency}
          </p>
          {startDate ? (
            <p className="text-xs text-atg-muted">
              {formatDisplayDate(startDate, locale)} → {formatDisplayDate(endDate, locale)} ·{' '}
              {t.durationDaysLabel.replace('{days}', String(durationDays))}
            </p>
          ) : null}
          {resolving ? (
            <p className="text-xs text-atg-muted">{t.resolvingPackage}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!canAddToCart}
          onClick={onAddToCart}
          className="min-h-[48px] shrink-0 rounded-lg bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {t.addToCart}
        </button>
      </div>
    </div>
  );
}
