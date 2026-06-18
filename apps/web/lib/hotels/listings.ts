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

export type HotelsSearchParams = {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

export type HotelDetailSearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  roomId?: string;
};

export function buildHotelDetailHref(
  id: string,
  params: HotelDetailSearchParams,
  hash?: string,
): string {
  const qs = new URLSearchParams();
  if (params.checkIn) qs.set('checkIn', params.checkIn);
  if (params.checkOut) qs.set('checkOut', params.checkOut);
  if (params.guests) qs.set('guests', params.guests);
  if (params.roomId) qs.set('roomId', params.roomId);
  const query = qs.toString();
  const base = `/hotels/${encodeURIComponent(id)}${query ? `?${query}` : ''}`;
  return hash ? `${base}${hash}` : base;
}

export function formatStayTotal(cents: number, currency: string, nights: number): string {
  const total = formatHotelPrice(cents, currency);
  if (nights <= 0) return total;
  const perNight = formatHotelPrice(Math.round(cents / nights), currency);
  return `${total} (${perNight}/night)`;
}
