'use client';

import { Card, cn } from '@africatourismgate/ui';
import type { PackageItemEnriched, PackageItemType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { getPackageItemTypeLabel } from '../../lib/package-item-type';
import { usePackageItemTypeLabels } from '../../lib/i18n/use-module-labels';
import { PackageItemTypeIcon } from './package-item-type-icon';

type CompositionGroup = {
  itemType: PackageItemType;
  count: number;
};

function groupItemsByType(items: PackageItemEnriched[]): CompositionGroup[] {
  const counts = new Map<PackageItemType, number>();
  for (const item of items) {
    counts.set(item.itemType, (counts.get(item.itemType) ?? 0) + 1);
  }

  const seen = new Set<PackageItemType>();
  const groups: CompositionGroup[] = [];
  for (const item of items) {
    if (seen.has(item.itemType)) continue;
    seen.add(item.itemType);
    groups.push({ itemType: item.itemType, count: counts.get(item.itemType) ?? 1 });
  }
  return groups;
}

type PackageCompositionBannerProps = {
  items: PackageItemEnriched[];
  className?: string;
};

export function PackageCompositionBanner({ items, className }: PackageCompositionBannerProps) {
  const t = useTranslations('modules.packages.sections.composition');
  const itemTypeLabels = usePackageItemTypeLabels();

  if (items.length === 0) return null;

  const groups = groupItemsByType(items);

  return (
    <Card variant="dashboard" className={cn(className)}>
      <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
      <p className="mt-1 text-xs text-atg-muted">
        {groups.length > 1
          ? t('summaryWithTypes', { productCount: items.length, typeCount: groups.length })
          : t('summary', { productCount: items.length })}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label={t('ariaLabel')}>
        {groups.map(({ itemType, count }) => (
          <li
            key={itemType}
            className="inline-flex items-center gap-2 rounded-full border border-atg-border bg-atg-elevated px-3 py-1.5"
          >
            <PackageItemTypeIcon itemType={itemType} size="sm" />
            <span className="text-sm text-atg-fg">
              {getPackageItemTypeLabel(itemType, itemTypeLabels)}
              {count > 1 ? (
                <span className="ml-1 tabular-nums text-atg-muted">×{count}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
