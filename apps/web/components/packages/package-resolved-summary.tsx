'use client';

import type { PackageLineSelection } from '../../lib/packages/package-lines';
import { lineMatchesPackageItem } from '../../lib/packages/package-lines';
import type { PackageItemEnriched } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { PackageItemTypeIcon } from './package-item-type-icon';

type PackageResolvedSummaryProps = {
  items: PackageItemEnriched[];
  lines: Array<PackageLineSelection | null>;
  t: Translations['packages'];
};

export function PackageResolvedSummary({
  items,
  lines,
  t,
}: PackageResolvedSummaryProps) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const line = lines[index] ?? null;
        const configured = Boolean(line && lineMatchesPackageItem(line, item));

        return (
          <li
            key={item.id}
            className="rounded-xl border border-atg-border bg-atg-surface px-4 py-3 dark:border-atg-border dark:bg-atg-surface/60"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PackageItemTypeIcon itemType={item.itemType} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {t.itemTypes[item.itemType]}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-atg-fg">{item.label}</p>
                  </div>
                  {configured ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {t.itemConfigured}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                      {t.itemPending}
                    </span>
                  )}
                </div>
                {configured && line ? (
                  <p className="mt-2 text-xs text-atg-muted">{describeLine(line, t)}</p>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function describeLine(line: PackageLineSelection, t: Translations['packages']): string {
  switch (line.lineType) {
    case 'activity':
      return t.recapActivityLine.replace('{n}', String(line.participants));
    case 'property':
      return t.recapPropertyLine
        .replace('{checkIn}', line.checkIn)
        .replace('{checkOut}', line.checkOut);
    case 'flight':
      return t.recapFlightLine.replace('{date}', line.departureDate);
    case 'vehicle':
      return t.recapVehicleLine
        .replace('{pickup}', line.pickupDate)
        .replace('{return}', line.returnDate);
    case 'cruise':
      return t.recapCruiseLine.replace('{guests}', String(line.guests));
    default:
      return '';
  }
}
