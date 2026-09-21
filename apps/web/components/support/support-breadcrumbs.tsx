'use client';

import { Breadcrumb, type BreadcrumbItem } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';

type SupportBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function SupportBreadcrumbs({ items }: SupportBreadcrumbsProps) {
  const t = useTranslations('support');

  return (
    <Breadcrumb items={items} ariaLabel={t('breadcrumbAria')} className="mb-6" />
  );
}
