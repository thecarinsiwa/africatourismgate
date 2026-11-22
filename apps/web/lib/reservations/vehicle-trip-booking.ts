import { createApiClient } from '@africatourismgate/api-client';
import type {
  AuthUser,
  BookingDetail,
  BookingManifestEntry,
  BookingStatus,
} from '@africatourismgate/types';
import {
  emptyEmergencyContactDraft,
  type EmergencyContactDraft,
} from '../../components/reservations/booking-emergency-contact-form';
import {
  emptyManifestEntryDraft,
  manifestEntryDraftFromApi,
  type ManifestEntryDraft,
} from '../../components/reservations/checkout-manifest-form';

const OPEN_BOOKING_STATUSES = new Set<BookingStatus>([
  'draft',
  'pending_approval',
  'pending_payment',
  'confirmed',
]);

function getApiBaseUrl(): string {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  return (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');
}

export type VehicleTripBookingPrefill = {
  bookingId: string | null;
  emergencyContact: EmergencyContactDraft;
  manifestEntries: ManifestEntryDraft[];
};

/** Find the caller's open booking that already claims seats on this shared trip. */
export async function findOpenBookingForVehicleTrip(
  accessToken: string,
  vehicleTripId: string,
): Promise<BookingDetail | null> {
  const client = createApiClient({
    baseUrl: getApiBaseUrl(),
    accessToken,
  });
  const page = await client.listBookings({ limit: 50, sortOrder: 'desc' });
  const candidates = page.data.filter((booking) =>
    OPEN_BOOKING_STATUSES.has(booking.status),
  );

  for (const booking of candidates) {
    const detail = await client.getBooking(booking.id);
    if (detail.items.some((item) => item.vehicleTripId === vehicleTripId)) {
      return detail;
    }
  }
  return null;
}

export async function loadVehicleTripBookingPrefill(
  accessToken: string,
  vehicleTripId: string,
  travelerCount: number,
  user: AuthUser | null,
): Promise<VehicleTripBookingPrefill> {
  const count = Math.max(1, travelerCount);
  const existing = await findOpenBookingForVehicleTrip(accessToken, vehicleTripId);

  if (existing) {
    const client = createApiClient({
      baseUrl: getApiBaseUrl(),
      accessToken,
    });
    let entries: BookingManifestEntry[] = [];
    try {
      entries = await client.listBookingManifestEntries(existing.booking.id);
    } catch {
      entries = [];
    }
    entries = [...entries].sort((a, b) => a.sortOrder - b.sortOrder);

    const manifestEntries = Array.from({ length: count }, (_, index) => {
      const fromApi = entries[index];
      return fromApi
        ? manifestEntryDraftFromApi(fromApi)
        : emptyManifestEntryDraft();
    });

    return {
      bookingId: existing.booking.id,
      emergencyContact: existing.emergencyContact
        ? {
            name: existing.emergencyContact.name?.trim() ?? '',
            phone: existing.emergencyContact.phone?.trim() ?? '',
            email: existing.emergencyContact.email?.trim() ?? '',
            country: existing.emergencyContact.country?.trim() ?? '',
            address: existing.emergencyContact.address?.trim() ?? '',
          }
        : emptyEmergencyContactDraft(),
      manifestEntries,
    };
  }

  const fullName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : '';
  const first = emptyManifestEntryDraft();
  if (fullName) first.fullName = fullName;

  const emergencyContact = emptyEmergencyContactDraft();
  if (fullName) emergencyContact.name = fullName;
  if (user?.phone) emergencyContact.phone = user.phone;
  if (user?.email) emergencyContact.email = user.email;

  return {
    bookingId: null,
    emergencyContact,
    manifestEntries: Array.from({ length: count }, (_, index) =>
      index === 0 ? first : emptyManifestEntryDraft(),
    ),
  };
}
