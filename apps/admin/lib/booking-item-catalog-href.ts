import type { BookingItemType } from '@africatourismgate/types';
import { adminSearchDeepLinks } from './admin-search/deep-links';

const BOOKING_ITEM_TYPES: ReadonlySet<string> = new Set([
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
  'package',
]);

/** Admin list routes when a deep link is not available from catalogProductId. */
const BOOKING_ITEM_CATALOG_LIST_HREFS: Record<BookingItemType, string> = {
  room: '/hebergements',
  flight_class: '/produits/vols',
  vehicle: '/produits/locations',
  cabin: '/produits/croisieres',
  activity_schedule: '/produits/activites',
  package: '/produits/forfaits',
};

function isBookingItemType(value: string): value is BookingItemType {
  return BOOKING_ITEM_TYPES.has(value);
}

/**
 * Admin catalogue URL for a booking line.
 * Prefer `catalogProductId` (parent product) when provided by the API;
 * packages can fall back to `referenceId`. Otherwise opens the vertical list.
 */
export function getBookingItemCatalogHref(
  itemType: string,
  referenceId: string,
  catalogProductId?: string | null,
): string | null {
  if (!isBookingItemType(itemType)) return null;

  const productId =
    catalogProductId?.trim() ||
    (itemType === 'package' ? referenceId.trim() : '');

  if (!productId) {
    return BOOKING_ITEM_CATALOG_LIST_HREFS[itemType];
  }

  switch (itemType) {
    case 'room':
      return adminSearchDeepLinks.property(productId);
    case 'flight_class':
      return adminSearchDeepLinks.flight(productId);
    case 'vehicle':
      return adminSearchDeepLinks.vehicle(productId);
    case 'cabin':
      return adminSearchDeepLinks.sailing(productId);
    case 'activity_schedule':
      return adminSearchDeepLinks.activity(productId);
    case 'package':
      return adminSearchDeepLinks.package(productId);
    default:
      return BOOKING_ITEM_CATALOG_LIST_HREFS[itemType];
  }
}
