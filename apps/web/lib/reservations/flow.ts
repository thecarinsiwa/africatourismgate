export type ReservationDraft = {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

function readString(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value[0] ?? '';
  return '';
}

export function parseReservationDraft(
  searchParams: Record<string, string | string[] | undefined>,
): ReservationDraft | null {
  const propertyId = readString(searchParams.propertyId);
  const roomId = readString(searchParams.roomId);
  const checkIn = readString(searchParams.checkIn);
  const checkOut = readString(searchParams.checkOut);
  const guestsRaw = readString(searchParams.guests);
  const guests = Number.parseInt(guestsRaw, 10);

  if (!propertyId || !roomId || !checkIn || !checkOut || !Number.isFinite(guests) || guests < 1) {
    return null;
  }

  return {
    propertyId,
    roomId,
    checkIn,
    checkOut,
    guests,
  };
}

export function buildReservationQuery(draft: ReservationDraft): string {
  const params = new URLSearchParams({
    propertyId: draft.propertyId,
    roomId: draft.roomId,
    checkIn: draft.checkIn,
    checkOut: draft.checkOut,
    guests: String(draft.guests),
  });
  return params.toString();
}

export type FlightReservationDraft = {
  flightId: string;
  flightClassId: string;
  departureDate: string;
  passengers: number;
};

export function buildFlightReservationQuery(draft: FlightReservationDraft): string {
  const params = new URLSearchParams({
    kind: 'flight_class',
    flightId: draft.flightId,
    flightClassId: draft.flightClassId,
    departureDate: draft.departureDate,
    passengers: String(draft.passengers),
  });
  return params.toString();
}
