import type { Translations } from '../i18n/translations';
import type { DataTablePaginationLabels } from '@africatourismgate/ui';

export function toListingPaginationLabels(
  listing: Translations['listing'],
): DataTablePaginationLabels {
  return {
    range: listing.range,
    pageOf: listing.pageOf,
    previousPage: listing.previousPage,
    nextPage: listing.nextPage,
    navAriaLabel: listing.navAriaLabel,
    pageAria: listing.pageAria,
  };
}

export function scrollListingToTop(): void {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
