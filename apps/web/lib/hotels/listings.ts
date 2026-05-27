import type { PropertySearchResult, PropertyType } from '@africatourismgate/types';

export type HotelSearchResult = PropertySearchResult;

export type HotelTypeFilter = PropertyType | 'all';

export type HotelAmenity = 'wifi' | 'pool' | 'breakfast' | 'spa' | 'parking';

export function formatHotelPrice(cents: number, currency: string): string {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function parseGuestsParam(guests?: string): number {
  const n = Number.parseInt(guests ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
