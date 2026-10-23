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

export { getBookingItemCatalogHref } from './booking-item-catalog-href';

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

export function getBookingItemCatalogLinkLabel(
  itemType: string,
  title: string,
  labels: Record<BookingItemType, string>,
  formatAriaLabel: (typeLabel: string, title: string) => string,
): string {
  const typeLabel = getBookingItemTypeLabel(itemType, labels);
  return formatAriaLabel(typeLabel, title);
}
