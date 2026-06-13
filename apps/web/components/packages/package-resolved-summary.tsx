'use client';

import type { PackageLineSelection } from '../../lib/packages/package-lines';
import type { PackageItemEnriched } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import type { PackageLineResolveError } from '../../lib/packages/auto-resolve-lines';

type PackageResolvedSummaryProps = {
  items: PackageItemEnriched[];
  lines: Array<PackageLineSelection | null>;
  errors: PackageLineResolveError[];
  resolving: boolean;
  t: Translations['packages'];
};

export function PackageResolvedSummary({
  items,
  lines,
  errors,
  resolving,
  t,
}: PackageResolvedSummaryProps) {
  const errorByItemId = new Map(errors.map((entry) => [entry.itemId, entry]));

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const line = lines[index] ?? null;
        const error = errorByItemId.get(item.itemId);
        const resolved = Boolean(line);

        return (
          <li
            key={item.id}
            className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-atg-border dark:bg-atg-surface/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {t.itemTypes[item.itemType]}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0f1a16] dark:text-white">
                  {item.label}
                </p>
              </div>
              {resolving ? (
                <span className="text-xs text-gray-500 dark:text-atg-muted">{t.resolvingItem}</span>
              ) : resolved ? (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {t.itemAutoResolved}
                </span>
              ) : (
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {error?.message === 'error' ? t.itemResolveError : t.itemUnavailable}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
