'use client';

import Link from 'next/link';
import { buildActivityDetailHref } from '../../lib/activities/listings';
import {
  formatPackagePrice,
  type PackagesSearchParams,
} from '../../lib/packages/listings';
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
  configureInline?: boolean;
  activityOnly?: boolean;
  searchParams?: PackagesSearchParams;
};

export function PackageItemsSection({
  items,
  t,
  configureInline = false,
  activityOnly = false,
  searchParams = {},
}: PackageItemsSectionProps) {
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
    <section
      id="items"
      className="scroll-mt-28 rounded-2xl border border-atg-border bg-atg-elevated p-6 dark:border-atg-border dark:bg-atg-elevated"
    >
      <h2 className="text-lg font-bold text-atg-fg">{t.itemsTitle}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const typeLabel = t.itemTypes[ITEM_TYPE_LABEL_KEYS[item.itemType]];
          const productBase = ITEM_PRODUCT_PATHS[item.itemType];
          const isActivity = item.itemType === 'activity';
          const showInlineConfigLink = isActivity && !activityOnly && !configureInline;
          const showExternalConfigureLink = !configureInline && !isActivity;

          let productHref: string | null = null;
          if (productBase && showExternalConfigureLink) {
            productHref = `${productBase}/${encodeURIComponent(item.itemId)}`;
          } else if (productBase && showInlineConfigLink) {
            productHref = buildActivityDetailHref(item.itemId, {
              date: searchParams.date,
              participants: searchParams.participants,
            });
          }

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
                {showExternalConfigureLink ? (
                  <p className="mt-1 text-xs text-atg-muted">
                    {t.configureOnProductHint}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-atg-fg/90">
                  {formatPackagePrice(item.unitPriceCents, item.currency)}
                </p>
                {productHref ? (
                  <Link
                    href={productHref}
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-atg-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary dark:border-atg-border"
                  >
                    {showExternalConfigureLink ? t.configureOnProduct : t.viewProduct}
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
