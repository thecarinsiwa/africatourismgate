import type { BookingMode } from '@africatourismgate/types';
import type { ReservationDraft } from '../reservations/flow';

/** Seed defaults until CE-11 exposes organization_settings.item_type_modes. */
const DEFAULT_ITEM_TYPE_MODES: Record<ReservationDraft['kind'], BookingMode> = {
  room: 'immediate',
  flight_class: 'immediate',
  vehicle: 'immediate',
  cabin: 'immediate',
  activity_schedule: 'assisted',
  package: 'assisted',
};

export function resolveBookingMode(draft: ReservationDraft): BookingMode {
  return DEFAULT_ITEM_TYPE_MODES[draft.kind];
}

export function isAssistedBookingDraft(draft: ReservationDraft): boolean {
  return resolveBookingMode(draft) === 'assisted';
}
