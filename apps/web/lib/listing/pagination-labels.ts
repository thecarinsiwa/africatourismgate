import type { DataTablePaginationLabels } from '@africatourismgate/ui';

/** next-intl `useTranslations('listing')` translator (ICU templates for range/pageOf/pageAria). */
export type ListingTranslator = {
  (key: string, values?: Record<string, string | number>): string;
};

export function toListingPaginationLabels(t: ListingTranslator): DataTablePaginationLabels {
  return {
    previousPage: t('previousPage'),
    nextPage: t('nextPage'),
    navAriaLabel: t('navAriaLabel'),
    pageAria: (page) => t('pageAria', { page }),
    range: (params) => t('range', params),
    pageOf: (params) => t('pageOf', params),
  };
}

export function scrollListingToTop(): void {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
