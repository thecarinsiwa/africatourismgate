'use client';

import { PageHeader } from '@africatourismgate/ui';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { routePathToTranslationNamespace } from '../../lib/i18n/admin-page-i18n';

type AdminListPageHeaderProps = {
  routePath: string;
  actions?: ReactNode;
  titleKey?: string;
  descriptionKey?: string;
};

export function AdminListPageHeader({
  routePath,
  actions,
  titleKey = 'title',
  descriptionKey = 'description',
}: AdminListPageHeaderProps) {
  const t = useTranslations(routePathToTranslationNamespace(routePath));

  return (
    <PageHeader
      title={t(titleKey)}
      description={t.has?.(descriptionKey) ? t(descriptionKey) : undefined}
      actions={actions}
    />
  );
}
