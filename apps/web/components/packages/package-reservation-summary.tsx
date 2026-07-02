'use client';

import { formatDisplayDate } from '../../lib/hotels/dates';
import type { PackageDetail } from '../../lib/packages/types';
import type { PackageReservationDraft } from '../../lib/reservations/flow';
import { packageReservationTotalCents } from '../../lib/reservations/flow';
import type { Translations } from '../../lib/i18n/translations';
import { PackageItemTypeIcon } from './package-item-type-icon';
import { formatPackagePrice } from '../../lib/packages/listings';

type PackageReservationSummaryProps = {
  draft: PackageReservationDraft;
  packageDetail: PackageDetail;
  t: Translations['packages'];
  locale?: string;
  showPricing?: boolean;
};

export function PackageReservationSummary({
  draft,
  packageDetail,
  t,
  locale,
  showPricing = false,
}: PackageReservationSummaryProps) {
  const totalCents = packageReservationTotalCents(packageDetail.pricing, draft.travelers);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-primary">{t.cardBadge}</p>
        <h2 className="text-xl font-bold text-atg-fg">{packageDetail.package.name}</h2>
        <p className="mt-2 text-sm text-atg-muted">
          {formatDisplayDate(draft.startDate, locale)} → {formatDisplayDate(draft.endDate, locale)}
          {' · '}
          {draft.travelers}{' '}
          {draft.travelers === 1 ? t.travelerSingular : t.travelerPlural}
        </p>
      </div>

      <ul className="space-y-3 border-t border-atg-border pt-4 dark:border-atg-border">
        {packageDetail.items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-atg-border px-4 py-3 dark:border-atg-border"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PackageItemTypeIcon itemType={item.itemType} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.itemTypes[item.itemType]}
                </p>
                <p className="mt-1 text-sm font-semibold text-atg-fg">{item.label}</p>
                <p className="mt-1 text-xs text-atg-muted">{t.assistedItemPendingSchedule}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showPricing ? (
        <p className="text-sm font-semibold text-atg-fg">
          {t.estimatedPackageTotal}: {formatPackagePrice(totalCents, packageDetail.pricing.currency)}
        </p>
      ) : null}

      {showPricing && packageDetail.pricing.discountAmountCents > 0 ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {t.youSave.replace(
            '{amount}',
            formatPackagePrice(
              packageDetail.pricing.discountAmountCents * draft.travelers,
              packageDetail.pricing.currency,
            ),
          )}
        </p>
      ) : null}
    </div>
  );
}
