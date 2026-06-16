import {
  SidebarActivityIcon,
  SidebarCarIcon,
  SidebarPackageIcon,
  SidebarPlaneIcon,
  SidebarPropertiesIcon,
  SidebarShipIcon,
} from '@africatourismgate/ui';
import type { BookingItemType } from '@africatourismgate/types';
import type { ComponentType } from 'react';
import { getItemTypeLabel } from './booking-item-labels';

type BookingItemTypeIconComponent = { className?: string };

const BOOKING_ITEM_TYPE_ICONS: Record<
  BookingItemType,
  ComponentType<BookingItemTypeIconComponent>
> = {
  room: SidebarPropertiesIcon,
  flight_class: SidebarPlaneIcon,
  vehicle: SidebarCarIcon,
  cabin: SidebarShipIcon,
  activity_schedule: SidebarActivityIcon,
  package: SidebarPackageIcon,
};

/** Admin list routes when a deep link is not available from referenceId alone. */
const BOOKING_ITEM_CATALOG_LIST_HREFS: Record<BookingItemType, string> = {
  room: '/hebergements',
  flight_class: '/produits/vols',
  vehicle: '/produits/locations',
  cabin: '/produits/croisieres',
  activity_schedule: '/produits/activites',
  package: '/produits/forfaits',
};

export function isBookingItemType(value: string): value is BookingItemType {
  return value in BOOKING_ITEM_TYPE_ICONS;
}

export function getBookingItemTypeLabel(
  itemType: string,
  labels: Record<BookingItemType, string>,
): string {
  return getItemTypeLabel(itemType, labels);
}

export function getBookingItemTypeIcon(
  itemType: string,
): ComponentType<BookingItemTypeIconComponent> {
  if (isBookingItemType(itemType)) {
    return BOOKING_ITEM_TYPE_ICONS[itemType];
  }
  return SidebarPackageIcon;
}

/**
 * Best-effort admin catalogue URL. Packages link directly; other types fall back
 * to the vertical list (referenceId often needs a parent entity id for edit routes).
 */
export function getBookingItemCatalogHref(
  itemType: string,
  referenceId: string,
): string | null {
  if (!referenceId.trim()) return null;
  if (!isBookingItemType(itemType)) return null;

  if (itemType === 'package') {
    return `/produits/forfaits/${referenceId}`;
  }

  return BOOKING_ITEM_CATALOG_LIST_HREFS[itemType];
}

export function getBookingItemCatalogLinkLabel(
  itemType: string,
  title: string,
  labels: Record<BookingItemType, string>,
  formatAriaLabel: (typeLabel: string, title: string) => string,
): string {
  const typeLabel = getBookingItemTypeLabel(itemType, labels);
  return formatAriaLabel(typeLabel, title);
}
