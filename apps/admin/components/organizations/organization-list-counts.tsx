'use client';

import { useFormatCount } from '../../lib/i18n/use-module-labels';
import { useTranslations } from 'next-intl';

type OrganizationListCountsProps = {
  userCount: number;
  employeeCount: number;
  productCount?: number;
};

function toCount(value: number | undefined | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function OrganizationListCounts({
  userCount,
  employeeCount,
  productCount = 0,
}: OrganizationListCountsProps) {
  const t = useTranslations('modules.organizations.list.counts');
  const formatCount = useFormatCount();

  const items = [
    {
      label: t('usersShort'),
      hint: t('usersHint'),
      value: toCount(userCount),
    },
    {
      label: t('employeesShort'),
      hint: t('employeesHint'),
      value: toCount(employeeCount),
    },
    {
      label: t('productsShort'),
      hint: t('productsHint'),
      value: toCount(productCount),
    },
  ] as const;

  return (
    <dl className="flex flex-wrap justify-end gap-x-3 gap-y-1">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline gap-1 whitespace-nowrap"
          title={item.hint}
        >
          <dt className="text-xs text-atg-muted">{item.label}</dt>
          <dd className="tabular-nums text-sm font-medium text-atg-fg">{formatCount(item.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
