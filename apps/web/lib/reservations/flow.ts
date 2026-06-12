import type { BookingCheckoutItem } from '@africatourismgate/types';

export type RoomReservationDraft = {
  kind: 'room';
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type FlightReservationDraft = {
  kind: 'flight_class';
  flightId: string;
  flightClassId: string;
  departureDate: string;
  passengers: number;
};

export type VehicleReservationDraft = {
  kind: 'vehicle';
  vehicleId: string;
  availabilitySlotId: string;
  pickupDate: string;
  returnDate: string;
};

export type ReservationDraft =
  | RoomReservationDraft
  | FlightReservationDraft
  | VehicleReservationDraft;

function readString(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
}

function readPositiveInt(value: string | string[] | undefined): number | null {
  const n = Number.parseInt(readString(value), 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

export function isRoomReservationDraft(
  draft: ReservationDraft,
): draft is RoomReservationDraft {
  return draft.kind === 'room';
}

export function isFlightReservationDraft(
  draft: ReservationDraft,
): draft is FlightReservationDraft {
  return draft.kind === 'flight_class';
}

export function isVehicleReservationDraft(
  draft: ReservationDraft,
): draft is VehicleReservationDraft {
  return draft.kind === 'vehicle';
}

export function parseReservationDraft(
  searchParams: Record<string, string | string[] | undefined>,
): ReservationDraft | null {
  const kind = readString(searchParams.kind);
  const flightClassId = readString(searchParams.flightClassId);
  const availabilitySlotId = readString(searchParams.availabilitySlotId);

  if (kind === 'vehicle' || availabilitySlotId) {
    const vehicleId = readString(searchParams.vehicleId);
    const pickupDate = readString(searchParams.pickupDate);
    const returnDate = readString(searchParams.returnDate);

    if (!vehicleId || !availabilitySlotId || !pickupDate || !returnDate) {
      return null;
    }

    return {
      kind: 'vehicle',
      vehicleId,
      availabilitySlotId,
      pickupDate,
      returnDate,
    };
  }

  if (kind === 'flight_class' || flightClassId) {
    const flightId = readString(searchParams.flightId);
    const departureDate = readString(searchParams.departureDate);
    const passengers = readPositiveInt(searchParams.passengers);

    if (!flightId || !flightClassId || !departureDate || passengers == null) {
      return null;
    }

    return {
      kind: 'flight_class',
      flightId,
      flightClassId,
      departureDate,
      passengers,
    };
  }

  const propertyId = readString(searchParams.propertyId);
  const roomId = readString(searchParams.roomId);
  const checkIn = readString(searchParams.checkIn);
  const checkOut = readString(searchParams.checkOut);
  const guests = readPositiveInt(searchParams.guests);

  if (!propertyId || !roomId || !checkIn || !checkOut || guests == null) {
    return null;
  }

  return {
    kind: 'room',
    propertyId,
    roomId,
    checkIn,
    checkOut,
    guests,
  };
}

export function buildReservationQuery(draft: ReservationDraft): string {
  if (draft.kind === 'vehicle') {
    const params = new URLSearchParams({
      kind: 'vehicle',
      vehicleId: draft.vehicleId,
      availabilitySlotId: draft.availabilitySlotId,
      pickupDate: draft.pickupDate,
      returnDate: draft.returnDate,
    });
    return params.toString();
  }

  if (draft.kind === 'flight_class') {
    const params = new URLSearchParams({
      kind: 'flight_class',
      flightId: draft.flightId,
      flightClassId: draft.flightClassId,
      departureDate: draft.departureDate,
      passengers: String(draft.passengers),
    });
    return params.toString();
  }

  const params = new URLSearchParams({
    propertyId: draft.propertyId,
    roomId: draft.roomId,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    guests: String(draft.guests),
  });
  return params.toString();
}

/** @deprecated Use buildReservationQuery with kind flight_class */
export function buildFlightReservationQuery(
  draft: Omit<FlightReservationDraft, 'kind'>,
): string {
  return buildReservationQuery({ kind: 'flight_class', ...draft });
}

export function buildCheckoutItems(draft: ReservationDraft): BookingCheckoutItem[] {
  if (draft.kind === 'vehicle') {
    return [
      {
        itemType: 'vehicle',
        referenceId: draft.availabilitySlotId,
        quantity: 1,
        startDate: draft.pickupDate,
        endDate: draft.returnDate,
      },
    ];
  }

  if (draft.kind === 'flight_class') {
    return [
      {
        itemType: 'flight_class',
        referenceId: draft.flightClassId,
        quantity: draft.passengers,
        date: draft.departureDate,
      },
    ];
  }

  return [
    {
      itemType: 'room',
      referenceId: draft.roomId,
      quantity: 1,
      startDate: draft.checkIn,
      endDate: draft.checkOut,
    },
  ];
}

export function buildDraftDetailHref(draft: ReservationDraft): string {
  if (draft.kind === 'vehicle') {
    const params = new URLSearchParams({
      pickupDate: draft.pickupDate,
      returnDate: draft.returnDate,
    });
    return `/cars/${encodeURIComponent(draft.vehicleId)}?${params.toString()}`;
  }

  if (draft.kind === 'flight_class') {
    const params = new URLSearchParams({
      departureDate: draft.departureDate,
      passengers: String(draft.passengers),
      classId: draft.flightClassId,
    });
    return `/flights/${encodeURIComponent(draft.flightId)}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    guests: String(draft.guests),
    roomId: draft.roomId,
  });
  return `/hotels/${encodeURIComponent(draft.propertyId)}?${params.toString()}`;
}

export function buildDraftBrowseHref(draft: ReservationDraft): string {
  if (draft.kind === 'flight_class') {
    return '/flights';
  }
  if (draft.kind === 'vehicle') {
    return '/cars';
  }
  return '/hotels';
}
