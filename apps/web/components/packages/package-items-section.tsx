'use client';

import Link from 'next/link';
import { formatPackagePrice } from '../../lib/packages/listings';
import type { PackageItemEnriched, PackageItemType } from '../../lib/packages/types';
import type { Translations } from '../../lib/i18n/translations';

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

const ITEM_PRODUCT_PATHS: Partial<Record<PackageItemType, string>> = {
  property: '/hotels',
  flight: '/flights',
  vehicle: '/cars',
  cruise: '/cruises',
  activity: '/activities',
};

type PackageItemsSectionProps = {
  items: PackageItemEnriched[];
  t: Translations['packages'];
};

export function PackageItemsSection({ items, t }: PackageItemsSectionProps) {
  if (items.length === 0) {
    return (
      <section id="items" className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated">
        <p className="text-sm text-gray-500 dark:text-atg-muted">{t.noItems}</p>
      </section>
    );
  }

  return (
    <section id="items" className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-atg-border dark:bg-atg-elevated">
      <h2 className="text-lg font-bold text-[#0f1a16] dark:text-white">{t.itemsTitle}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const typeLabel = t.itemTypes[ITEM_TYPE_LABEL_KEYS[item.itemType]];
          const productBase = ITEM_PRODUCT_PATHS[item.itemType];
          const productHref = productBase
            ? `${productBase}/${encodeURIComponent(item.itemId)}`
            : null;

          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 dark:border-atg-border"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {typeLabel}
                </p>
                <p className="font-medium text-[#0f1a16] dark:text-white">{item.label}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-white/90">
                  {formatPackagePrice(item.unitPriceCents, item.currency)}
                </p>
                {productHref ? (
                  <Link
                    href={productHref}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {t.viewProduct}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
