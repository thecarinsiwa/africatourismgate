'use client';

import type { PackageItemEnriched } from '../../lib/packages/types';
import { formatDisplayDate } from '../../lib/hotels/dates';
import type { Translations } from '../../lib/i18n/translations';
import { PackageItemTypeIcon } from './package-item-type-icon';

type PackageAssistedResolvedSummaryProps = {
  items: PackageItemEnriched[];
  startDate: string;
  endDate: string;
  travelers: number;
  t: Translations['packages'];
  locale?: string;
};

export function PackageAssistedResolvedSummary({
  items,
  startDate,
  endDate,
  travelers,
  t,
  locale,
}: PackageAssistedResolvedSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-atg-border bg-atg-surface px-4 py-3 text-sm dark:border-atg-border dark:bg-atg-surface/60">
        <p className="font-medium text-atg-fg">{t.departureDateLabel}</p>
        <p className="mt-1 text-atg-muted">
          {formatDisplayDate(startDate, locale)} → {formatDisplayDate(endDate, locale)}
        </p>
        <p className="mt-2 font-medium text-atg-fg">{t.travelersLabel}</p>
        <p className="mt-1 text-atg-muted">{travelers}</p>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-atg-border bg-atg-surface px-4 py-3 dark:border-atg-border dark:bg-atg-surface/60"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PackageItemTypeIcon itemType={item.itemType} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.itemTypes[item.itemType]}
                </p>
                <p className="mt-1 text-sm font-semibold text-atg-fg">{item.label}</p>
                <p className="mt-2 text-xs text-atg-muted">{t.assistedItemPendingSchedule}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
