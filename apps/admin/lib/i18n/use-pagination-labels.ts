'use client';

import type { DataTablePaginationLabels } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export function useDataTablePaginationLabels(): DataTablePaginationLabels {
  const t = useTranslations('modules.common.paginationUi');

  return useMemo(
    () => ({
      range: ({ start, end, total, itemLabel, pluralSuffix }) =>
        t('range', { start, end, total, itemLabel, pluralSuffix }),
      pageOf: ({ page, totalPages }) => t('pageOf', { page, totalPages }),
      previousPage: t('previousPage'),
      nextPage: t('nextPage'),
      navAriaLabel: t('navAriaLabel'),
      pageAria: (page) => t('pageAria', { page }),
    }),
    [t],
  );
}

export function usePaginationPluralSuffix(totalItems: number): string {
  const t = useTranslations('modules.common.paginationUi');
  return totalItems > 1 ? t('pluralSuffix') : '';
}
