import type { BookingItemType } from '@africatourismgate/types';

export const BOOKING_ITEM_TYPES: BookingItemType[] = [
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
  'package',
];

export function getItemTypeLabel(
  itemType: string,
  labels: Record<BookingItemType, string>,
): string {
  return labels[itemType as BookingItemType] ?? itemType;
}
