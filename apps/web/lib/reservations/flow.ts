import type { BookingCheckoutItem, BookingCheckoutRequest } from '@africatourismgate/types';
import type { ActivityDetail } from '../activities/types';
import type { VehicleDetail } from '../cars/types';
import type { CruiseSailingDetail } from '../cruises/types';
import type { FlightDetail } from '../flights/types';
import type { PackageItemEnriched } from '../packages/types';
import {
  appendPackageLineToParams,
  buildPackageLinesDraft,
  parsePackageLinesFromSearchParams,
  type PackageLineSelection,
} from '../packages/package-lines';
import { buildPackageDetailHrefWithLines } from '../packages/listings';

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

export type CabinReservationDraft = {
  kind: 'cabin';
  sailingId: string;
  cabinAvailabilityId: string;
  guests: number;
};

export type ActivityScheduleReservationDraft = {
  kind: 'activity_schedule';
  activityId: string;
  scheduleId: string;
  date: string;
  participants: number;
};

export type PackageReservationDraft = {
  kind: 'package';
  packageId: string;
  lines: PackageLineSelection[];
};

export type { PackageLineSelection } from '../packages/package-lines';

export type ReservationDraft =
  | RoomReservationDraft
  | FlightReservationDraft
  | VehicleReservationDraft
  | CabinReservationDraft
  | ActivityScheduleReservationDraft
  | PackageReservationDraft;

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

export function isCabinReservationDraft(
  draft: ReservationDraft,
): draft is CabinReservationDraft {
  return draft.kind === 'cabin';
}

export function isActivityScheduleReservationDraft(
  draft: ReservationDraft,
): draft is ActivityScheduleReservationDraft {
  return draft.kind === 'activity_schedule';
}

export function isPackageReservationDraft(
  draft: ReservationDraft,
): draft is PackageReservationDraft {
  return draft.kind === 'package';
}

/** Cabin can be booked when it exists, has stock, and fits the guest count. */
export function isCabinOfferBookable(
  cabin: { availableCount: number; maxGuests: number } | null | undefined,
  guests: number,
): cabin is { availableCount: number; maxGuests: number } {
  return Boolean(cabin && cabin.availableCount > 0 && cabin.maxGuests >= guests);
}

/** Activity schedule can be booked when it has enough remaining places. */
export function isActivityScheduleOfferBookable(
  schedule: { remainingPlaces: number } | null | undefined,
  participants: number,
): schedule is { remainingPlaces: number } {
  return Boolean(schedule && schedule.remainingPlaces >= participants);
}

export type PackageDraftValidationData = {
  activityDetails: Record<string, ActivityDetail | null | undefined>;
  propertyDetails: Record<string, import('@africatourismgate/types').PropertyDetail | null | undefined>;
  flightDetails: Record<string, FlightDetail | null | undefined>;
  vehicleDetails: Record<string, VehicleDetail | null | undefined>;
  cruiseDetails: Record<string, CruiseSailingDetail | null | undefined>;
};

export function isPackageReservationDraftReady(
  draft: PackageReservationDraft,
  validation: PackageDraftValidationData,
): boolean {
  return draft.lines.every((line) => isPackageLineSelectionReady(line, validation));
}

function isPackageLineSelectionReady(
  line: PackageLineSelection,
  validation: PackageDraftValidationData,
): boolean {
  switch (line.lineType) {
    case 'activity': {
      const activity = validation.activityDetails[line.itemId];
      const schedule = activity?.schedules.find((item) => item.scheduleId === line.scheduleId);
      return isActivityScheduleOfferBookable(schedule, line.participants);
    }
    case 'property': {
      const property = validation.propertyDetails[line.itemId];
      const room = property?.rooms.find((item) => item.id === line.roomId);
      return Boolean(room?.available);
    }
    case 'flight': {
      const flight = validation.flightDetails[line.itemId];
      const flightClass = flight?.classes.find((item) => item.id === line.flightClassId);
      return Boolean(flightClass && flightClass.availableSeats >= line.passengers);
    }
    case 'vehicle': {
      const vehicle = validation.vehicleDetails[line.itemId];
      return Boolean(
        vehicle && vehicle.availabilitySlot.id === line.availabilitySlotId,
      );
    }
    case 'cruise': {
      const sailing = validation.cruiseDetails[line.sailingId];
      const cabin = sailing?.cabins.find(
        (item) => item.availabilityId === line.cabinAvailabilityId && item.cabinId === line.itemId,
      );
      return isCabinOfferBookable(cabin, line.guests);
    }
    default:
      return false;
  }
}

export function parseReservationDraft(
  searchParams: Record<string, string | string[] | undefined>,
): ReservationDraft | null {
  const kind = readString(searchParams.kind);
  const flightClassId = readString(searchParams.flightClassId);
  const availabilitySlotId = readString(searchParams.availabilitySlotId);
  const cabinAvailabilityId = readString(searchParams.cabinAvailabilityId);
  const scheduleId = readString(searchParams.scheduleId);

  if (kind === 'package') {
    const packageId = readString(searchParams.packageId);
    const lines = parsePackageLinesFromSearchParams(searchParams);
    if (!packageId || !lines) return null;
    return { kind: 'package', packageId, lines };
  }

  if (kind === 'activity_schedule' || scheduleId) {
    const activityId = readString(searchParams.activityId);
    const date = readString(searchParams.date);
    const participants = readPositiveInt(searchParams.participants);

    if (!activityId || !scheduleId || !date || participants == null) {
      return null;
    }

    return {
      kind: 'activity_schedule',
      activityId,
      scheduleId,
      date,
      participants,
    };
  }

  if (kind === 'cabin' || cabinAvailabilityId) {
    const sailingId = readString(searchParams.sailingId);
    const guests = readPositiveInt(searchParams.guests);

    if (!sailingId || !cabinAvailabilityId || guests == null) {
      return null;
    }

    return {
      kind: 'cabin',
      sailingId,
      cabinAvailabilityId,
      guests,
    };
  }

  if (kind === 'vehicle' || availabilitySlotId) {
    const vehicleId = readString(searchParams.vehicleId);
    const pickupDate = readString(searchParams.pickupDate);
    const returnDate = readString(searchParams.returnDate);

    if (!vehicleId || !availabilitySlotId || !pickupDate || !returnDate) {
      return null;
    }
    if (returnDate <= pickupDate) {
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
  if (draft.kind === 'package') {
    const params = new URLSearchParams({
      kind: 'package',
      packageId: draft.packageId,
      lineCount: String(draft.lines.length),
    });
    draft.lines.forEach((line, index) => {
      appendPackageLineToParams(params, index, line);
    });
    return params.toString();
  }

  if (draft.kind === 'activity_schedule') {
    const params = new URLSearchParams({
      kind: 'activity_schedule',
      activityId: draft.activityId,
      scheduleId: draft.scheduleId,
      date: draft.date,
      participants: String(draft.participants),
    });
    return params.toString();
  }

  if (draft.kind === 'cabin') {
    const params = new URLSearchParams({
      kind: 'cabin',
      sailingId: draft.sailingId,
      cabinAvailabilityId: draft.cabinAvailabilityId,
      guests: String(draft.guests),
    });
    return params.toString();
  }

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
  if (draft.kind === 'package') {
    return draft.lines.map((line) => packageLineToCheckoutItem(line));
  }

  if (draft.kind === 'activity_schedule') {
    return [
      {
        itemType: 'activity_schedule',
        referenceId: draft.scheduleId,
        quantity: draft.participants,
      },
    ];
  }

  if (draft.kind === 'cabin') {
    return [
      {
        itemType: 'cabin',
        referenceId: draft.cabinAvailabilityId,
        quantity: 1,
      },
    ];
  }

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

export function buildCheckoutRequest(draft: ReservationDraft): BookingCheckoutRequest {
  if (draft.kind === 'package') {
    return {
      items: buildCheckoutItems(draft),
      packageId: draft.packageId,
    };
  }

  return {
    items: buildCheckoutItems(draft),
  };
}

export function buildPackageReservationDraft(
  packageId: string,
  items: PackageItemEnriched[],
  selections: Array<PackageLineSelection | null | undefined>,
): PackageReservationDraft | null {
  return buildPackageLinesDraft(packageId, items, selections);
}

function packageLineToCheckoutItem(line: PackageLineSelection): BookingCheckoutItem {
  switch (line.lineType) {
    case 'activity':
      return {
        itemType: 'activity_schedule',
        referenceId: line.scheduleId,
        quantity: line.participants,
      };
    case 'property':
      return {
        itemType: 'room',
        referenceId: line.roomId,
        quantity: 1,
        startDate: line.checkIn,
        endDate: line.checkOut,
      };
    case 'flight':
      return {
        itemType: 'flight_class',
        referenceId: line.flightClassId,
        quantity: line.passengers,
        date: line.departureDate,
      };
    case 'vehicle':
      return {
        itemType: 'vehicle',
        referenceId: line.availabilitySlotId,
        quantity: 1,
        startDate: line.pickupDate,
        endDate: line.returnDate,
      };
    case 'cruise':
      return {
        itemType: 'cabin',
        referenceId: line.cabinAvailabilityId,
        quantity: 1,
      };
    default:
      throw new Error('Unsupported package line type');
  }
}

export function buildDraftDetailHref(draft: ReservationDraft): string {
  if (draft.kind === 'package') {
    return buildPackageDetailHrefWithLines(
      draft.packageId,
      {},
      draft.lines,
      '#configure',
    );
  }

  if (draft.kind === 'activity_schedule') {
    const params = new URLSearchParams({
      date: draft.date,
      participants: String(draft.participants),
      scheduleId: draft.scheduleId,
    });
    return `/activities/${encodeURIComponent(draft.activityId)}?${params.toString()}`;
  }

  if (draft.kind === 'cabin') {
    const params = new URLSearchParams({
      guests: String(draft.guests),
      cabinId: draft.cabinAvailabilityId,
    });
    return `/cruises/${encodeURIComponent(draft.sailingId)}?${params.toString()}`;
  }

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
  if (draft.kind === 'package') {
    return '/packages';
  }
  if (draft.kind === 'activity_schedule') {
    const params = new URLSearchParams({
      date: draft.date,
      participants: String(draft.participants),
    });
    const query = params.toString();
    return query ? `/activities?${query}` : '/activities';
  }
  if (draft.kind === 'cabin') {
    return '/cruises';
  }
  if (draft.kind === 'flight_class') {
    return '/flights';
  }
  if (draft.kind === 'vehicle') {
    return '/cars';
  }
  return '/hotels';
}
