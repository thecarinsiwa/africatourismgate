'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import type { PackageDetail, PackageItemEnriched } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { PackagePriceDisplay } from './package-price-display';

type PackageBookingSidebarProps = {
  detail: PackageDetail;
  date: string | null;
  participants: number;
  activityIds: string[];
  selections: Record<string, string | undefined>;
  canAddToCart: boolean;
  onParticipantsChange: (value: number) => void;
  onAddToCart: () => void;
  t: Translations['packages'];
  a: Translations['activities'];
  locale?: string;
};

export function PackageBookingSidebar({
  detail,
  date,
  participants,
  activityIds,
  selections,
  canAddToCart,
  onParticipantsChange,
  onAddToCart,
  t,
  a,
  locale,
}: PackageBookingSidebarProps) {
  const selectedCount = activityIds.filter((id) => selections[id]).length;
  const participantsLabel =
    participants === 1
      ? `1 ${a.participantSingular}`
      : a.participantPlural.replace('{n}', String(participants));

  return (
    <aside
      id="reserve"
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-atg-border dark:bg-atg-elevated lg:sticky lg:top-24"
    >
      <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">{t.pricingTitle}</h2>

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

      <div className="mt-6 space-y-4 border-t border-gray-100 pt-4 dark:border-atg-border">
        {date ? (
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm dark:bg-white/5">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-atg-muted">
              {a.date}
            </p>
            <p className="mt-1 font-medium text-[#0f1a16] dark:text-white">
              {formatDisplayDate(date, locale)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t.selectDateHint}</p>
        )}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-gray-600 dark:text-atg-muted">
            {a.participants}
          </span>
          <input
            type="number"
            min={1}
            max={50}
            value={participants}
            onChange={(event) =>
              onParticipantsChange(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
            }
            className="min-h-[44px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-atg-border dark:bg-atg-surface dark:text-white"
          />
        </label>

        <p className="text-sm text-gray-600 dark:text-atg-muted">
          {t.schedulesProgress
            .replace('{selected}', String(selectedCount))
            .replace('{total}', String(activityIds.length))}
          {' · '}
          {participantsLabel}
        </p>

        {!canAddToCart && date && selectedCount < activityIds.length && (
          <p className="text-sm text-amber-700 dark:text-amber-300">{t.allSchedulesRequired}</p>
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
  canAddToCart,
  onAddToCart,
  t,
}: Pick<PackageBookingSidebarProps, 'detail' | 'canAddToCart' | 'onAddToCart' | 't'>) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-atg-border dark:bg-atg-elevated/95 lg:hidden pb-safe">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-atg-muted">{t.packagePrice}</p>
          <p className="text-lg font-bold text-[#0f1a16] dark:text-white">
            {(detail.pricing.totalCents / 100).toFixed(0)} {detail.pricing.currency}
          </p>
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
