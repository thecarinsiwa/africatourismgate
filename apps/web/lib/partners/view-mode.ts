import type { PublicActivityProviderListItem } from '@africatourismgate/types';

export const PARTNERS_VIEW_MODES = ['grid', 'list', 'table'] as const;

export type PartnersViewMode = (typeof PARTNERS_VIEW_MODES)[number];

export const PARTNERS_VIEW_MODE_STORAGE_KEY = 'partners.viewMode';

export const DEFAULT_PARTNERS_VIEW_MODE: PartnersViewMode = 'grid';

export function isPartnersViewMode(value: unknown): value is PartnersViewMode {
  return typeof value === 'string' && (PARTNERS_VIEW_MODES as readonly string[]).includes(value);
}

export const PARTNERS_SORT_KEYS = ['name-asc', 'name-desc', 'activities', 'rating'] as const;

export type PartnersSortKey = (typeof PARTNERS_SORT_KEYS)[number];

export function isPartnersSortKey(value: unknown): value is PartnersSortKey {
  return typeof value === 'string' && (PARTNERS_SORT_KEYS as readonly string[]).includes(value);
}

export function sortPartners(
  partners: readonly PublicActivityProviderListItem[],
  sort: PartnersSortKey,
): PublicActivityProviderListItem[] {
  const byName = (a: PublicActivityProviderListItem, b: PublicActivityProviderListItem) =>
    a.name.localeCompare(b.name);
  const copy = [...partners];
  switch (sort) {
    case 'name-desc':
      return copy.sort((a, b) => byName(b, a));
    case 'activities':
      return copy.sort(
        (a, b) => (b.activitiesCount ?? 0) - (a.activitiesCount ?? 0) || byName(a, b),
      );
    case 'rating':
      return copy.sort(
        (a, b) =>
          (b.averageRating ?? -1) - (a.averageRating ?? -1) ||
          (b.reviewCount ?? 0) - (a.reviewCount ?? 0) ||
          byName(a, b),
      );
    case 'name-asc':
    default:
      return copy.sort(byName);
  }
}
