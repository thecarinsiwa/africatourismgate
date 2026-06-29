import type { BookingMode, ResolvedBookingItemTypeModes } from '@africatourismgate/types';
import {
  DEFAULT_BOOKING_ITEM_TYPE_MODES,
  normalizeBookingItemTypeModes,
  resolveBookingModeForItemType,
} from '@africatourismgate/types/tour-guide';
import type { ReservationDraft } from '../reservations/flow';

export { DEFAULT_BOOKING_ITEM_TYPE_MODES, normalizeBookingItemTypeModes };

export function resolveBookingMode(
  draft: ReservationDraft,
  modes: ResolvedBookingItemTypeModes = DEFAULT_BOOKING_ITEM_TYPE_MODES,
): BookingMode {
  return resolveBookingModeForItemType(draft.kind, modes);
}

export function isAssistedBookingDraft(
  draft: ReservationDraft,
  modes?: ResolvedBookingItemTypeModes,
): boolean {
  return resolveBookingMode(draft, modes) === 'assisted';
}

export function getBookingCtaLabel(
  kind: ReservationDraft['kind'],
  labels: { bookNow: string; requestBooking: string },
  modes: ResolvedBookingItemTypeModes = DEFAULT_BOOKING_ITEM_TYPE_MODES,
): string {
  return resolveBookingModeForItemType(kind, modes) === 'assisted'
    ? labels.requestBooking
    : labels.bookNow;
}
