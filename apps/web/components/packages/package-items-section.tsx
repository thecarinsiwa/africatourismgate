'use client';

import { useState } from 'react';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageItemEnriched, PackageItemType } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';
import { PackageItemDetailModal } from './package-item-detail-modal';

const ITEM_TYPE_LABEL_KEYS: Record<
  PackageItemType,
  keyof Translations['packages']['itemTypes']
> = {
  property: 'property',
  flight: 'flight',
  vehicle: 'vehicle',
  cruise: 'cruise',
  activity: 'activity',
};

type PackageItemsSectionProps = {
  items: PackageItemEnriched[];
  t: Translations['packages'];
  a: Translations['activities'];
  startDate?: string;
  travelers?: number;
  showHeading?: boolean;
};

export function PackageItemsSection({
  items,
  t,
  a,
  startDate,
  travelers,
  showHeading = true,
}: PackageItemsSectionProps) {
  const [selectedItem, setSelectedItem] = useState<PackageItemEnriched | null>(null);

  if (items.length === 0) {
    return (
      <section
        id="items"
        className="scroll-mt-28 rounded-2xl border border-dashed border-atg-border bg-atg-elevated p-6 dark:border-atg-border dark:bg-atg-elevated"
      >
        <p className="text-sm text-atg-muted">{t.noItems}</p>
      </section>
    );
  }

  return (
    <>
      <section
        id="items"
        className={
          showHeading
            ? 'scroll-mt-28 rounded-2xl border border-atg-border bg-atg-elevated p-6 dark:border-atg-border dark:bg-atg-elevated'
            : undefined
        }
      >
        {showHeading ? (
          <h2 className="text-lg font-bold text-atg-fg">{t.itemsTitle}</h2>
        ) : null}
        <ul className={showHeading ? 'mt-4 space-y-3' : 'space-y-3'}>
          {items.map((item) => {
            const typeLabel = t.itemTypes[ITEM_TYPE_LABEL_KEYS[item.itemType]];

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-atg-border px-4 py-3 dark:border-atg-border"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {typeLabel}
                  </p>
                  <p className="font-medium text-atg-fg">{item.label}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-atg-fg/90">
                    {formatPackagePrice(item.unitPriceCents, item.currency)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary dark:border-atg-border"
                  >
                    {t.viewProduct}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <PackageItemDetailModal
        item={selectedItem}
        open={selectedItem != null}
        onClose={() => setSelectedItem(null)}
        startDate={startDate}
        travelers={travelers}
        t={t}
        a={a}
      />
    </>
  );
}
